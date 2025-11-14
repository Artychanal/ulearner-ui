import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ToggleFavoriteDto } from './dto/create-favorite.dto';

@Controller({ path: 'favorites', version: '1' })
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me')
  list(@CurrentUser('userId') userId: string) {
    return this.favoritesService.list(userId);
  }

  @Post('toggle')
  toggle(@CurrentUser('userId') userId: string, @Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(userId, dto);
  }
}
