import { Injectable } from '@nestjs/common';
import { DirectionsRequest, Client as GoogleMapsClient, PlaceInputType, TravelMode } from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DirectionsService {
    constructor(
        private readonly googleMapsClient: GoogleMapsClient,
        private readonly configService: ConfigService
    ) {}

    async getDirections(placeOriginId: string, placeDestinationId: string) {
        const params: DirectionsRequest['params'] = {
            origin: `place_id:${placeOriginId.replace(/place_id:/g, '')}`,
            destination: `place_id:${placeDestinationId.replace(/place_id:/g, '')}`,
            mode: TravelMode.driving,
            key: this.configService.get<string>('GOOGLE_MAPS_API_KEY')
        }

        const { data } = await this.googleMapsClient.directions({
            params
        })

        return {
            ...data,
            request: {
                origin: {
                    place_id: params.origin,
                    location: {
                        lat: data.routes[0].legs[0].start_location.lat,
                        lng: data.routes[0].legs[0].start_location.lng
                    }
                },
                destination: {
                    place_id: params.destination,
                    location: {
                        lat: data.routes[0].legs[0].end_location.lat,
                        lng: data.routes[0].legs[0].end_location.lng
                    }
                },
                mode: params.mode
            }
        }
    }
}
