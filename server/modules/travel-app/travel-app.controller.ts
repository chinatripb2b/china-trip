import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import type { Request } from 'express';
import { TravelAppService } from './travel-app.service';
import type { ITravelAppPayload } from './travel-app.types';

@Controller('api/travel-app')
export class TravelAppController {
  constructor(private readonly travelAppService: TravelAppService) {}

  @Get('latest')
  async getLatest(@Req() req: Request) {
    return this.travelAppService.getLatestRecord(this.getUserId(req));
  }

  @Post('save')
  async save(@Req() req: Request, @Body() body: ITravelAppPayload) {
    return this.travelAppService.saveRecord(this.getUserId(req), body);
  }

  private getUserId(req: Request) {
    const requestUserId = (req as Request & { userContext?: { userId?: string } }).userContext?.userId;
    return requestUserId || 'anonymous-user';
  }
}
