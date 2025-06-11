import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroContent, HeroContentSchema } from '../../common/schemas/hero-content.schema';
import { FAQ, FAQSchema } from '../../common/schemas/faq.schema';
import { PaymentMethod, PaymentMethodSchema } from '../../common/schemas/payment-method.schema';
import { PrizeCarouselContent, PrizeCarouselContentSchema } from '../../common/schemas/prize-carousel.schema';
import { InfoTicker, InfoTickerSchema } from '../../common/schemas/info-ticker.schema';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeroContent.name, schema: HeroContentSchema },
      { name: FAQ.name, schema: FAQSchema },
      { name: PaymentMethod.name, schema: PaymentMethodSchema },
      { name: PrizeCarouselContent.name, schema: PrizeCarouselContentSchema },
      { name: InfoTicker.name, schema: InfoTickerSchema },
    ]),
    AuthModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
