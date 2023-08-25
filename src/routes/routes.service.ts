import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { DirectionsService } from '../maps/directions/directions.service';
import { RoutesSerializer } from './routes.serializer';

@Injectable()
export class RoutesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly directionsService: DirectionsService
  ) {

  }
  async create(createRouteDto: CreateRouteDto) {
    const { available_travel_modes, geocoded_waypoints, routes, request } = await this.directionsService.getDirections(createRouteDto.source_id, createRouteDto.destination_id)

    const legs = routes[0].legs[0]
    return this.prismaService.route.create({ 
      data: {
        name: createRouteDto.name,
        source: {
          name: legs.start_address,
          location: {
            lat: legs.start_location.lat,
            lng: legs.start_location.lng
          }
        },
        destination: {
          name: legs.end_address,
          location: {
            lat: legs.end_location.lat,
            lng: legs.end_location.lng
          }
        },
        distance: legs.distance.value,
        duration: legs.duration.value,
        directions: JSON.stringify({
          available_travel_modes,
          geocoded_waypoints,
          routes,
          request
        })
      }
    })
  }

  async findAll() {
    const routes = await this.prismaService.route.findMany()
    return routes.map(route => new RoutesSerializer(route))
  }

  async findOne(id: string) {
    const route = await this.prismaService.route.findFirstOrThrow({
      where: { id }
    })

    return new RoutesSerializer(route)
  }

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return `This action updates a #${id} route`;
  }

  remove(id: number) {
    return `This action removes a #${id} route`;
  }
}
