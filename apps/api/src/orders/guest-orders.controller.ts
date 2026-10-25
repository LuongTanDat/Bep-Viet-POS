import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrdersService } from './orders.service';

class DongMonKhachDto {
  @IsString() monId!: string;
  @IsInt() @Min(1) soLuong!: number;
  @IsOptional() @IsString() ghiChu?: string;
}
class TaoDonKhachDto {
  @IsString() maBan!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => DongMonKhachDto) chiTiet!: DongMonKhachDto[];
  @IsOptional() @IsString() ghiChu?: string;
}

/** API tối giản dành cho khách quét QR; không yêu cầu tài khoản nhân viên. */
@Controller('khach')
export class GuestOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('don-hang')
  tao(@Body() dto: TaoDonKhachDto) {
    return this.orders.taoDonKhach(dto.maBan, dto.chiTiet, dto.ghiChu);
  }

  @Get('don-hang/:maDon')
  theoDoi(@Param('maDon') maDon: string) {
    return this.orders.layTheoMa(maDon);
  }
}
