import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from '../entities';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([NguoiDung]), AuthModule],
  controllers: [UsersController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class UsersModule {}
