import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { NguoiDung } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NguoiDung) private readonly nguoiDungRepo: Repository<NguoiDung>,
    private readonly jwt: JwtService,
  ) {}

  /** Đăng nhập bằng tên đăng nhập + mật khẩu và trả JWT cho frontend. */
  async dangNhap(tenDangNhap: string, matKhau: string) {
    const nguoiDung = await this.nguoiDungRepo.findOne({ where: { tenDangNhap } });
    if (!nguoiDung || !nguoiDung.dangHoatDong) throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa.');
    const hopLe = await bcrypt.compare(matKhau, nguoiDung.matKhauBam);
    if (!hopLe) throw new UnauthorizedException('Mật khẩu không đúng.');

    const payload = {
      sub: nguoiDung.id,
      tenDangNhap: nguoiDung.tenDangNhap,
      hoTen: nguoiDung.hoTen,
      vaiTro: nguoiDung.vaiTro,
    };
    return {
      accessToken: await this.jwt.signAsync(payload),
      nguoiDung: {
        id: nguoiDung.id,
        hoTen: nguoiDung.hoTen,
        tenDangNhap: nguoiDung.tenDangNhap,
        vaiTro: nguoiDung.vaiTro,
      },
    };
  }
}
