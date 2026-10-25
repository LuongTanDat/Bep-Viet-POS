import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanNhaHang, DatBan } from '../entities';
import { BookingsController } from './bookings.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ imports: [TypeOrmModule.forFeature([DatBan, BanNhaHang]), AuthModule], controllers: [BookingsController], providers: [JwtAuthGuard, RolesGuard] })
export class BookingsModule {}
