import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanNhaHang, DonHang, ThanhToan } from '../entities';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ imports: [TypeOrmModule.forFeature([ThanhToan, DonHang, BanNhaHang]), AuthModule], controllers: [ReportsController], providers: [JwtAuthGuard, RolesGuard] })
export class ReportsModule {}
