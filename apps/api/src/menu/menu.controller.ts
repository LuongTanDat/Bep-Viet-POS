import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { MonAn, NhomMon, TramBep, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class TaoMonDto {
  @IsString() ten!: string;
  @IsString() nhomId!: string;
  @IsInt() @Min(0) gia!: number;
  @IsOptional() @IsString() moTa?: string;
  @IsOptional() @IsString() hinhAnh?: string;
  @IsOptional() @IsEnum(TramBep) tramBep?: TramBep;
}
class CapNhatMonDto {
  @IsOptional() @IsString() ten?: string;
  @IsOptional() @IsInt() @Min(0) gia?: number;
  @IsOptional() @IsString() moTa?: string;
  @IsOptional() @IsBoolean() dangBan?: boolean;
  @IsOptional() @IsEnum(TramBep) tramBep?: TramBep;
}

@Controller('thuc-don')
export class MenuController {
  constructor(
    @InjectRepository(MonAn) private readonly monRepo: Repository<MonAn>,
    @InjectRepository(NhomMon) private readonly nhomRepo: Repository<NhomMon>,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Public để menu QR của khách có thể tải mà không cần tài khoản nhân viên. */
  @Get()
  async danhSach() {
    return { nhom: await this.nhomRepo.find({ order: { thuTu: 'ASC' } }), mon: await this.monRepo.find({ order: { ten: 'ASC' } }) };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY)
  async taoMon(@Body() dto: TaoMonDto) {
    const mon = await this.monRepo.save(this.monRepo.create({
      ten: dto.ten,
      nhom_id: dto.nhomId,
      gia: dto.gia,
      moTa: dto.moTa ?? '',
      hinhAnh: dto.hinhAnh ?? '',
      tramBep: dto.tramBep ?? TramBep.BEP_NONG,
    }));
    this.realtime.phat('thuc-don.thay-doi', mon);
    return mon;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.BEP)
  async capNhat(@Param('id') id: string, @Body() dto: CapNhatMonDto) {
    const mon = await this.monRepo.findOneByOrFail({ id });
    Object.assign(mon, dto);
    const ketQua = await this.monRepo.save(mon);
    this.realtime.phat('thuc-don.thay-doi', ketQua);
    return ketQua;
  }
}
