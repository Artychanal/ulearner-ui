import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshRepository: Repository<RefreshTokenEntity>,
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

    const tokens = await this.issueTokens(payload.sub, payload.email);
    return {
      ...tokens,
      user: UserResponseDto.fromEntity(stored.user),
    };
  }
}
