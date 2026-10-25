import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CAC_THUC_THE } from './entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TablesModule } from './tables/tables.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: CAC_THUC_THE,
        /** Chỉ bật synchronize cho demo/dev. Production phải dùng migration. */
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    TablesModule,
    MenuModule,
    RealtimeModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    BookingsModule,
    InventoryModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}
