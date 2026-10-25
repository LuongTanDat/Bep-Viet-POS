import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/realtime', cors: { origin: '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    client.emit('ket-noi', { thongDiep: 'Đã kết nối realtime Bếp Việt POS.' });
  }

  /** Phát sự kiện nghiệp vụ tới tất cả màn hình đang mở. */
  phat(tenSuKien: string, duLieu: unknown) {
    this.server?.emit(tenSuKien, duLieu);
  }
}
