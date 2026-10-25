import { Module } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ imports: [OrdersModule, AuthModule], controllers: [KitchenController], providers: [JwtAuthGuard, RolesGuard] })
export class KitchenModule {}
