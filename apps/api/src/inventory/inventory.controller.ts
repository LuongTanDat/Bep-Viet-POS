import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNumber } from 'class-validator';
import { Repository } from 'typeorm';
import { TonKho, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

class DieuChinhKhoDto { @IsNumber() thayDoi!: number; }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kho')
export class InventoryController {
  constructor(@InjectRepository(TonKho) private readonly repo: Repository<TonKho>) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.BEP)
  danhSach() { return this.repo.find({ order: { tenNguyenLieu: 'ASC' } }); }

  @Patch(':id/dieu-chinh')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY)
  async dieuChinh(@Param('id') id: string, @Body() dto: DieuChinhKhoDto) {
    const item = await this.repo.findOneByOrFail({ id });
    item.soLuong = Math.max(0, item.soLuong + dto.thayDoi);
    return this.repo.save(item);
  }
}
