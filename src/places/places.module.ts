import { Module } from '@nestjs/common';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  controllers: [PlacesController],
  providers: 
    [
        {
            provide: GoogleMapsClient,
            useValue: new GoogleMapsClient()
        }, 
        PlacesService
    ],
  exports: [PlacesService]
})
export class PlacesModule {}
