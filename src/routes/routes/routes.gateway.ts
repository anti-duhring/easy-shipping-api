import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io'
import { RoutesDriverService } from '../routes-driver/routes-driver.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class RoutesGateway {
  // constructor(private routesDriverService: RoutesDriverService){}
  constructor(@InjectQueue('new-point') private newPointQueue: Queue){}

  @SubscribeMessage('new-point')
  async handleMessage(client: Socket, payload: { route_id: string, lat: number, lng: number }): Promise<void> {
    // this.routesDriverService.createOrUpdate(payload)
    client.broadcast.emit('admin-new-point', payload)
    client.broadcast.emit(`new-point/${payload.route_id}`,  payload)
    await this.newPointQueue.add(payload)
  }
}
