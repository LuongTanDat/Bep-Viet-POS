import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { PhuongThucThanhToan, VaiTroNguoiDung } from '../entities';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

class ThanhToanDto { @IsEnum(PhuongThucThanhToan) phuongThuc!: PhuongThucThanhToan; }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thanh-toan')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get('cho-thanh-toan')
  @VaiTro(VaiTroNguoiDung.THU_NGAN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.ADMIN)
  hoaDonChoThanhToan() { return this.service.hoaDonChoThanhToan(); }

  @Post(':donId')
  @VaiTro(VaiTroNguoiDung.THU_NGAN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.ADMIN)
  thanhToan(@Param('donId') donId: string, @Body() dto: ThanhToanDto) { return this.service.thanhToan(donId, dto.phuongThuc); }

  @Get('lich-su')
  @VaiTro(VaiTroNguoiDung.THU_NGAN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.ADMIN)
  lichSu() { return this.service.lichSu(); }
}
