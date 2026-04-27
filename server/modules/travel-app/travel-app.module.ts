import { Module } from '@nestjs/common';

import { TravelAppController } from './travel-app.controller';
import { TravelAppService } from './travel-app.service';

@Module({
  controllers: [TravelAppController],
  providers: [TravelAppService],
})
export class TravelAppModule {}
