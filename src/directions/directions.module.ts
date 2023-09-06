import { Module } from '@nestjs/common';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import { DirectionsController } from '../directions/directions.controller';
import { DirectionsService } from '../directions/directions.service';

@Module({
  controllers: [ DirectionsController],
  providers: 
    [
        {
            provide: GoogleMapsClient,
            useValue: new GoogleMapsClient()
        }, 
        DirectionsService
    ],
  exports: [DirectionsService]
})
export class DirectionsModule {}
