import { Job } from "bull";
import { RoutesDriverService } from "./routes-driver/routes-driver.service";
import { Process, Processor } from "@nestjs/bull";
import { Inject } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

@Processor('kafka-producer')
export class KafkaProducerJob{
    constructor(
        @Inject('KAFKA_SERVICE')
        private readonly kafkaService: ClientKafka){}

    @Process()
    async handle(job: Job<any>) {
        await this.kafkaService.emit('route', job.data)

        return {}
    }
}