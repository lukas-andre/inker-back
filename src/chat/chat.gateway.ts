import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { inspect } from 'util';

@WebSocketGateway(3012, { namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger(ChatGateway.name);

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('New Connection!');
    this.logger.log(inspect(client));
  }
  handleDisconnect(client: Socket) {
    this.logger.log('Disconnection');
    this.logger.log(inspect(client));
  }

  @SubscribeMessage('chatToServer')
  handleMessage(
    client: Socket,
    message: { sender: string; message: string; room: string },
  ) {
    console.log('message: ', message);
    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    client.emit('leftRoom', room);
  }
}
