import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma/prisma.service';
import { CreateRouteDriverDto } from '../dto/create-route.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DirectionsResponseData } from '@googlemaps/google-maps-services-js';
import { Counter } from 'prom-client'
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class RoutesDriverService {
    constructor(
        private readonly prismaService: PrismaService,
        @InjectQueue('kafka-producer') private kafkaProducerQueue: Queue,
        @InjectMetric('route_started_counter')
        private readonly routeStartedCounter: Counter,
        @InjectMetric('route_finished_counter')
        private readonly routeFinishedCounter: Counter
    ) {}

    async createOrUpdate(routeDriverDto: CreateRouteDriverDto) {
        const countRouteDriver = await this.prismaService.routeDriver.count({
            where: { route_id: routeDriverDto.route_id }
        })

        const routeDriver = await this.prismaService.routeDriver.upsert({
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

        if(countRouteDriver === 0) {
            this.routeStartedCounter.inc()
            await this.kafkaProducerQueue.add({
                event: 'RouteStarted',
                id: routeDriver.route.id,
                name: routeDriver.route.name,
                started_at: new Date().toISOString()
            })
            return routeDriver
        } 

        const directions: DirectionsResponseData = JSON.parse(routeDriver.route.directions as string)
        const lastPoint = directions.routes[0].legs[0].steps[
            directions.routes[0].legs[0].steps.length - 1
        ]

        if(lastPoint.end_location.lat === routeDriverDto.lat && lastPoint.end_location.lng === routeDriverDto.lng) {
            this.routeFinishedCounter.inc()
            await this.kafkaProducerQueue.add({
                event: 'RouteFinished',
                id: routeDriver.route.id,
                name: routeDriver.route.name,
                finished_at: new Date().toISOString(),
                lat: routeDriverDto.lat,
                lng: routeDriverDto.lng 
            })

            return routeDriver
        }

        await this.kafkaProducerQueue.add({
            event: 'DriverMoved',
            id: routeDriver.route.id,
            name: routeDriver.route.name,
            lat: routeDriverDto.lat,
            lng: routeDriverDto.lng 
        })
        return routeDriver
    }
}
