import { SetMetadata } from '@nestjs/common';
import { VaiTroNguoiDung } from '../../entities';

export const KHOA_VAI_TRO = 'vai_tro_cho_phep';

/** Khai báo các vai trò được phép gọi endpoint. */
export const VaiTro = (...vaiTro: VaiTroNguoiDung[]) => SetMetadata(KHOA_VAI_TRO, vaiTro);
