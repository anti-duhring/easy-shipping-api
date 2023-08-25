import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma/prisma.service';
import { CreateRouteDriverDto } from '../dto/create-route.dto';

@Injectable()
export class RoutesDriverService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async createOrUpdate(routeDriverDto: CreateRouteDriverDto) {
        // const countRouteDriver = await this.prismaService.routeDriver.count({
        //     where: { route_id: routeDriverDto.route_id }
        // })

        return this.prismaService.routeDriver.upsert({
            include: {
                route: true
            },
            where: {
                route_id: routeDriverDto.route_id
            },
            create: {
                route_id: routeDriverDto.route_id,
                points: {
                    set: {
                        location: {
                            lat: routeDriverDto.lat,
                            lng: routeDriverDto.lng
                        }
                    }
                }
            },
            update: {
                points: {
                    push: {
                        location: {
                            lat: routeDriverDto.lat,
                            lng: routeDriverDto.lng
                        }
                    }
                }
            },
            
        })
    }
}
