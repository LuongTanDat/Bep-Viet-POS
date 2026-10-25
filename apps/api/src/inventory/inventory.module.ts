import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TonKho } from '../entities';
import { InventoryController } from './inventory.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ imports: [TypeOrmModule.forFeature([TonKho]), AuthModule], controllers: [InventoryController], providers: [JwtAuthGuard, RolesGuard] })
export class InventoryModule {}
