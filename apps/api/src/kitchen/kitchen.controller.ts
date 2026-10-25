import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { TrangThaiDon, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@VaiTro(VaiTroNguoiDung.BEP, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.ADMIN)
@Controller('bep')
export class KitchenController {
  constructor(private readonly orders: OrdersService) {}

  @Get('kds')
  async kds() {
    const ds = await this.orders.danhSach();
    return ds.filter((don) => [TrangThaiDon.DA_GUI_BEP, TrangThaiDon.DANG_CHE_BIEN, TrangThaiDon.SAN_SANG].includes(don.trangThai));
  }

  @Patch(':id/bat-dau')
  batDau(@Param('id') id: string) { return this.orders.doiTrangThai(id, TrangThaiDon.DANG_CHE_BIEN); }

  @Patch(':id/hoan-thanh')
  hoanThanh(@Param('id') id: string) { return this.orders.doiTrangThai(id, TrangThaiDon.SAN_SANG); }
}
