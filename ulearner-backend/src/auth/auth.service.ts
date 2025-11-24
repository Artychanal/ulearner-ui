import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import { randomUUID } from 'crypto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(PasswordResetTokenEntity)
    private readonly passwordResetRepository: Repository<PasswordResetTokenEntity>,
    private readonly mailService: MailService,
  ) {}

  private async hashPassword(plain: string) {
    return bcrypt.hash(plain, 10);
  }

  private async validatePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokensDto> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('auth.jwtSecret'),
        expiresIn: this.configService.get<string>('auth.jwtExpiresIn', '15m'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('auth.refreshSecret'),
        expiresIn: this.configService.get<string>('auth.refreshExpiresIn', '7d'),
      },
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpiresInMs(this.configService.get<string>('auth.refreshExpiresIn', '7d')),
    );

    await this.refreshRepository
      .createQueryBuilder()
      .delete()
      .where('"user_id" = :userId', { userId })
      .execute();

    const userRef = { id: userId } as Pick<UserEntity, 'id'>;

    await this.refreshRepository.save(
      this.refreshRepository.create({
        user: userRef as UserEntity,
        token: refreshToken,
        expiresAt,
      }),
    );

    return { accessToken, refreshToken };
  }

  private parseExpiresInMs(value: string): number {
    if (!value) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      return Number(value) || 0;
    }
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
      default:
        return amount * 24 * 60 * 60 * 1000;
    }
  }

  async register(dto: CreateUserDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('Account with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.create(dto, passwordHash);
    const tokens = await this.issueTokens(user.id, user.email);

    return {
      ...tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === 'blocked') {
      throw new UnauthorizedException('Account is blocked');
    }

    const valid = await this.validatePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const stored = await this.refreshRepository.findOne({
      where: { token: dto.refreshToken },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
      secret: this.configService.get<string>('auth.refreshSecret'),
    });

    if (stored.user?.status === 'blocked') {
      throw new UnauthorizedException('Account is blocked');
    }

    const tokens = await this.issueTokens(payload.sub, payload.email);
    return {
      ...tokens,
      user: UserResponseDto.fromEntity(stored.user),
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    const response = {
      message: 'If an account with this email exists, we sent password reset instructions.',
    };

    if (!user) {
      return response;
    }

    await this.passwordResetRepository.delete({ userId: user.id });
    const tokenValue = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.passwordResetRepository.save(
      this.passwordResetRepository.create({
        token: tokenValue,
        userId: user.id,
        expiresAt,
      }),
    );

    const webUrl = (this.configService.get<string>('app.webUrl') ?? 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${webUrl}/reset-password?token=${tokenValue}`;

    const formattedExpires = expiresAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Reset your ULearner password',
      text: `Hi ${user.name},\n\nUse the link below to reset your ULearner password. This link expires on ${formattedExpires}.\n\n${resetUrl}\n\nIf you didn't request this change, you can safely ignore this email.`,
      html: `
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your ULearner password. Click the button below to set a new one.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4c5fd5;color:white;border-radius:8px;text-decoration:none;">Reset password</a></p>
        <p>This link expires on <strong>${formattedExpires}</strong>. If you didn't request a reset, you can safely ignore this email.</p>
        <p>Stay curious,<br/>The ULearner Team</p>
      `,
    });

    return response;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AuthResponseDto> {
    const entry = await this.passwordResetRepository.findOne({ where: { token: dto.token } });
    if (!entry || entry.expiresAt.getTime() < Date.now() || entry.usedAt) {
      throw new BadRequestException('This reset link is invalid or has expired.');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.updatePassword(entry.userId, passwordHash);

    entry.usedAt = new Date();
    await this.passwordResetRepository.save(entry);

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientId = this.configService.get<string>('google.clientId');
    if (!clientId) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }
    const payload = (await response.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };

    if (payload.aud !== clientId) {
      throw new UnauthorizedException('Google token audience mismatch');
    }
    if (!payload.email || payload.email_verified === 'false') {
      throw new UnauthorizedException('Google account email not verified');
    }
    return payload as Required<Pick<typeof payload, 'email'>> & typeof payload;
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthResponseDto> {
    const payload = await this.verifyGoogleIdToken(dto.idToken);
    const email = payload.email.toLowerCase();
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      const passwordHash = await this.hashPassword(randomUUID());
      user = await this.usersService.create(
        {
          name: payload.name ?? email,
          email,
          avatarUrl: payload.picture,
          password: 'generated',
        } as CreateUserDto,
        passwordHash,
      );
    } else if (user.status === 'blocked') {
      throw new UnauthorizedException('Account is blocked');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...tokens,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
