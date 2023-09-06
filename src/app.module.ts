import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RoutesModule } from './routes/routes.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DirectionsModule } from './directions/directions.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379
      }
    }),
    PrismaModule, 
    RoutesModule, 
    DirectionsModule,
    PlacesModule,
    PrometheusModule.register()
  ],
})
export class AppModule {}
