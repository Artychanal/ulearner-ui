import { Body, Controller, Get, Logger, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findOne(userId);
    return UserResponseDto.fromEntity(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    this.logger.log(
      `Profile update for ${userId}: ${JSON.stringify({
        name: dto.name,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        hasPassword: Boolean(dto.password),
      })}`,
    );
    const user = await this.usersService.update(userId, dto);
    return UserResponseDto.fromEntity(user);
  }
}
