import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { RoutesDriverService } from './routes-driver.service';
import { RoutesGateway } from './routes.gateway';
import { BullModule } from '@nestjs/bull';
import { NewPointJob } from './new-point.job';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerJob } from './kafka-producer.job';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { DirectionsModule } from 'src/directions/directions.module';

@Module({
  imports: [
    DirectionsModule,
    BullModule.registerQueue({ name: 'new-point'}, { name: 'kafka-producer' }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nest',
            brokers: ['kafka:9094']
          }
        }
      }
    ]),
  ],
  controllers: [RoutesController],
  providers: [
    RoutesService, 
    RoutesDriverService, 
    RoutesGateway, 
    NewPointJob, 
    KafkaProducerJob,
    makeCounterProvider({
      name: 'route_started_counter',
      help: 'Number of routes started'
    }),
    makeCounterProvider({
      name: 'route_finished_counter',
      help: 'Number of routes finished'
    })
  ],
})
export class RoutesModule {}
