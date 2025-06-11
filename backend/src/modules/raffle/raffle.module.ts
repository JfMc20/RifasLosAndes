import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Raffle, RaffleSchema } from '../../common/schemas/raffle.schema';
import { Promotion, PromotionSchema } from '../../common/schemas/promotion.schema';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';
import { TicketModule } from '../ticket/ticket.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Raffle.name, schema: RaffleSchema },
      { name: Promotion.name, schema: PromotionSchema },
    ]),
    TicketModule,
    AuthModule,
  ],
  controllers: [RaffleController],
  providers: [RaffleService],
  exports: [RaffleService],
})
export class RaffleModule {}
