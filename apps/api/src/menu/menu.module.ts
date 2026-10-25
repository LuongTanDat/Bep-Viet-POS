import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonAn, NhomMon } from '../entities';
import { MenuController } from './menu.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([MonAn, NhomMon]), AuthModule, RealtimeModule],
  controllers: [MenuController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class MenuModule {}
