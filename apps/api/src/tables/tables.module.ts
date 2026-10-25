import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanNhaHang } from '../entities';
import { TablesController } from './tables.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([BanNhaHang]), AuthModule, RealtimeModule],
  controllers: [TablesController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class TablesModule {}
