import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanNhaHang, ChiTietDon, DonHang, MonAn } from '../entities';
import { OrdersController } from './orders.controller';
import { GuestOrdersController } from './guest-orders.controller';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([DonHang, ChiTietDon, MonAn, BanNhaHang]), AuthModule, RealtimeModule],
  controllers: [OrdersController, GuestOrdersController],
  providers: [OrdersService, JwtAuthGuard, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
