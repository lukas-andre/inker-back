import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { inspect } from 'util';

@WebSocketGateway(3012, { namespace: 'alert' })
export class AlertGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger(AlertGateway.name);
  
  @WebSocketServer() wss: Server;  

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('New Connection!'); 
    this.logger.log(inspect(client.json));
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Disconection');
    this.logger.log(inspect(client.json));
  }

  @SubscribeMessage('sendAlert')
  handleMessage(
    client: Socket,
    message: { sender: string; message: string },
  ) {
    console.log('message: ', message);
    this.wss.emit('chatToClient', message);
  }
}
