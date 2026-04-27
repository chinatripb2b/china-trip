import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DATABASE } from '@lark-apaas/fullstack-nestjs-core';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { travelAppRecordTable } from '../../database/schema';
import type { ITravelAppPayload, ITravelAppResponse } from './travel-app.types';

@Injectable()
export class TravelAppService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: NodePgDatabase) {}

  async getLatestRecord(userId: string): Promise<ITravelAppResponse | null> {
    const [record] = await this.db
      .select()
      .from(travelAppRecordTable)
      .where(eq(travelAppRecordTable.userId, userId))
      .orderBy(desc(travelAppRecordTable.updatedAt))
      .limit(1);

    if (!record) {
      return null;
    }

    return {
      profile: {
        id: record.userId,
        name: record.profileName,
        company: record.profileCompany,
        role: record.profileRole,
        avatar: record.profileAvatar,
        phone: record.profilePhone,
      },
      estimateForm: {
        travelers: record.travelers,
        days: record.days,
        destination: record.destination,
        hotelLevel: record.hotelLevel as ITravelAppResponse['estimateForm']['hotelLevel'],
        transportNeeds: record.transportNeeds,
        guideService: record.guideService,
        ticketBudget: record.ticketBudget,
        extraNotes: record.extraNotes,
      },
      estimateResult: {
        totalCost: record.totalCost,
        perPersonCost: record.perPersonCost,
        hotelCost: record.hotelCost,
        transportCost: record.transportCost,
        guideCost: record.guideCost,
        ticketCost: record.ticketCost,
        otherCost: record.otherCost,
      },
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async saveRecord(userId: string, payload: ITravelAppPayload): Promise<ITravelAppResponse> {
    await this.db.insert(travelAppRecordTable).values({
      id: randomUUID(),
      userId,
      profileName: payload.profile.name,
      profileCompany: payload.profile.company ?? '',
      profileRole: payload.profile.role ?? '',
      profileAvatar: payload.profile.avatar ?? '',
      profilePhone: payload.profile.phone ?? '',
      travelers: payload.estimateForm.travelers,
      days: payload.estimateForm.days,
      destination: payload.estimateForm.destination,
      hotelLevel: payload.estimateForm.hotelLevel,
      transportNeeds: payload.estimateForm.transportNeeds ?? '',
      guideService: payload.estimateForm.guideService ?? false,
      ticketBudget: payload.estimateForm.ticketBudget ?? 0,
      extraNotes: payload.estimateForm.extraNotes ?? '',
      totalCost: payload.estimateResult.totalCost,
      perPersonCost: payload.estimateResult.perPersonCost,
      hotelCost: payload.estimateResult.hotelCost,
      transportCost: payload.estimateResult.transportCost,
      guideCost: payload.estimateResult.guideCost,
      ticketCost: payload.estimateResult.ticketCost,
      otherCost: payload.estimateResult.otherCost,
    });

    const savedRecord = await this.getLatestRecord(userId);
    if (!savedRecord) {
      throw new Error('保存测算记录失败');
    }

    return savedRecord;
  }
}
