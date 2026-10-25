'use client';
import { ChefHat, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { luuPhien, type Phien } from '@/lib/auth';
import { ROLE_TO_PATH, VAI_TRO } from '@/lib/navigation';
import { useTheme } from '@/components/ThemeProvider';

export default function DangNhapPage() {
  const router = useRouter();
  const { cheDo, doiCheDo } = useTheme();
  const [tenDangNhap, setTenDangNhap] = useState('quanly');
  const [matKhau, setMatKhau] = useState('123456');
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);

  /** Đăng nhập và điều hướng đúng workspace theo vai trò trả về từ API. */
  async function dangNhap() {
    setDangGui(true); setLoi('');
    try {
      const phien = await api<Phien>('/auth/dang-nhap', { method: 'POST', body: JSON.stringify({ tenDangNhap, matKhau }) });
      luuPhien(phien);
      const path = ROLE_TO_PATH[phien.nguoiDung.vaiTro];
      router.push(`/${path}/${VAI_TRO[path].trangMacDinh}`);
    } catch (error: any) {
      setLoi(error.message);
    } finally { setDangGui(false); }
  }

  return <main className="bv-login">
    <section className="bv-login-visual bv-login-lines">
      <div className="bv-brand"><div className="bv-brand-mark"><ChefHat size={24}/></div><div><div className="bv-brand-name">Bếp Việt</div><div className="bv-brand-sub">Hệ thống nhà hàng</div></div></div>
      <div className="bv-login-hero"><div className="bv-kicker">Vận hành nhà hàng cao cấp</div><h1>Vận hành tinh tế.<br/>Phục vụ liền mạch.</h1><p>Từ sơ đồ bàn, gọi món, màn hình bếp đến thanh toán — mọi bộ phận cùng làm việc trên một luồng dữ liệu thống nhất.</p></div>
      <div className="bv-login-note">BẾP VIỆT POS · Giao diện đen–vàng cao cấp · Toàn bộ tiếng Việt</div>
    </section>
    <section className="bv-login-panel"><div className="bv-login-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:30}}><div><div className="bv-kicker">ĐĂNG NHẬP HỆ THỐNG</div></div><button className="bv-icon-btn" onClick={doiCheDo} title="Đổi giao diện">{cheDo==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button></div>
      <h2>Chào mừng trở lại.</h2><div className="bv-muted">Đăng nhập bằng tài khoản nhân viên để vào đúng không gian làm việc.</div>
      <div className="bv-field"><label>Tên đăng nhập</label><input className="bv-input" value={tenDangNhap} onChange={e=>setTenDangNhap(e.target.value)} onKeyDown={e=>e.key==='Enter'&&dangNhap()}/></div>
      <div className="bv-field"><label>Mật khẩu</label><input type="password" className="bv-input" value={matKhau} onChange={e=>setMatKhau(e.target.value)} onKeyDown={e=>e.key==='Enter'&&dangNhap()}/></div>
      {loi&&<div className="bv-error">{loi}</div>}
      <button className="bv-btn gold block" style={{marginTop:20}} onClick={dangNhap} disabled={dangGui}>{dangGui?'Đang đăng nhập…':'Đăng nhập'}</button>
      <div className="bv-demo-accounts"><div style={{fontSize:11,fontWeight:900,marginBottom:4}}>Tài khoản demo · mật khẩu 123456</div>{[['admin','Admin'],['quanly','Quản lý'],['phucvu','Phục vụ'],['bep','Bếp'],['thungan','Thu ngân']].map(([u,r])=><button key={u} className="bv-demo-row" style={{border:0,background:'transparent',color:'inherit',padding:3}} onClick={()=>{setTenDangNhap(u);setMatKhau('123456')}}><span>{r}</span><strong>{u}</strong></button>)}</div>
      <button className="bv-btn ghost block" style={{marginTop:10}} onClick={()=>router.push('/khach/thuc-don?ban=B02')}>Xem giao diện khách quét QR</button>
    </div></section>
  </main>;
}
