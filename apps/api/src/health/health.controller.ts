import { Controller, Get } from '@nestjs/common';
@Controller('suc-khoe')
export class HealthController {
  @Get()
  kiemTra() { return { ok: true, dichVu: 'Bếp Việt POS API', thoiGian: new Date().toISOString() }; }
}
