import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';


@WebSocketGateway({cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() WSS: Server
  constructor(
      private readonly messageWsService: MessageWsService,
      private readonly jwtService: JwtService ) {}


  async handleConnection(client: Socket) {
    const token = client.handshake.headers.autenticacion as string; //datosd que se toma de la conexion del cliente
    let payload: JwtPayload;

    try {
        payload =  this.jwtService.verify(token);
        await this.messageWsService.registerClient(client, payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }
    //console.log('Clients Connected.', client.id);
    //console.log(client);
    //console.log({payload});
    
    // console.log({conectados: this.messageWsService.getConnectedClients()});
    this.WSS.emit('clients-updated', this.messageWsService.getConnectedClients()); //avis a todos los conectados
  }

  handleDisconnect(client: Socket) {
     //console.log('Clients Disconnected.', client.id);
     this.messageWsService.removeClient(client.id);
      // console.log({conectados: this.messageWsService.getConnectedClients()});
      this.WSS.emit('clients-updated', this.messageWsService.getConnectedClients()); //avis a todos los conectados
  }

  @SubscribeMessage('message-from-client') //espera el valor del cliente
  OnMessageFrom(client:Socket, payload:NewMessageDto){
     //console.log(client.id, payload);
    //!emite SOLO al cliente q envio
    //  client.emit('message-from-server',{
    //     fullName:"It's Me!!",
    //     message: payload.message || 'no-message!!'
    //  });

     //!emitir a todos MENOS al cliente q envio
    //  client.broadcast.emit('message-from-server',{
    //     fullName:"It's Me!!",
    //     message: payload.message || 'no-message!!'
    //  });

     //!emitir a todos INCLUIDO al cliente q envio
     this.WSS.emit('message-from-server',{
        fullName: this.messageWsService.getUserFullName(client.id), //"It's Me!!",
        message: payload.message || 'no-message!!'
     });
  }
}

