import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminStatsService } from './admin-stats.service';

@Controller({ path: 'admin/stats', version: '1' })
@UseGuards(AdminSessionGuard)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get()
  getOverview() {
    return this.adminStatsService.getOverview();
  }
}
