'use client';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, CircleDollarSign, Clock3, PackageOpen, ReceiptText, Table2, UsersRound } from 'lucide-react';
import { api, ngayGioVietNam, tienVietNam } from '@/lib/api';
import type { Ban, BaoCao, DatBan, Mon, NguoiDung, NhomMon, TonKho } from '@/lib/types';
import { Badge, Card, Empty, Loading, PageHead, StatCard, useToast } from '@/components/ui';

const nhanTrangThaiBan: Record<string,string> = { TRONG:'Trống', DA_DAT:'Đã đặt', DANG_PHUC_VU:'Đang phục vụ', CHO_THANH_TOAN:'Chờ thanh toán', CHO_DON:'Chờ dọn' };
const badgeBan = (s:string) => s==='TRONG'?'success':s==='DA_DAT'?'info':s==='CHO_DON'?'danger':'warning';

export function TongQuanView({ admin = false }: { admin?: boolean }) {
  const [data, setData] = useState<BaoCao|null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<BaoCao>('/bao-cao/tong-quan').then(setData).finally(()=>setLoading(false)); }, []);
  if (loading) return <Loading/>;
  const d = data ?? { doanhThu:0, soDon:0, hoaDonDaThanhToan:0, giaTriTrungBinh:0, banDangPhucVu:0, tongSoBan:0 };
  return <>
    <PageHead title={admin ? 'Trung tâm điều hành' : 'Tổng quan vận hành'} description={admin ? 'Theo dõi hệ thống, doanh thu và nhịp vận hành của Bếp Việt.' : 'Nhìn nhanh tình hình bàn, đơn hàng và doanh thu trong ngày.'}/>
    <section className="bv-hero"><div className="bv-hero-copy"><div className="bv-kicker">BẾP VIỆT · VẬN HÀNH NHÀ HÀNG CAO CẤP</div><h2>Một không gian vận hành tinh gọn cho trải nghiệm phục vụ cao cấp.</h2><p>Dữ liệu từ phục vụ, bếp và thu ngân được gom về một luồng thống nhất để giảm sai sót và tăng tốc độ phục vụ.</p></div><div className="bv-hero-art"/></section>
    <div className="bv-grid-4">
      <StatCard label="Doanh thu hôm nay" value={tienVietNam(d.doanhThu)} foot="Từ giao dịch đã thanh toán" icon={CircleDollarSign}/>
      <StatCard label="Đơn hàng" value={d.soDon} foot="Đơn phát sinh trong ngày" icon={ReceiptText}/>
      <StatCard label="Bàn đang phục vụ" value={`${d.banDangPhucVu}/${d.tongSoBan}`} foot="Công suất phục vụ hiện tại" icon={Table2}/>
      <StatCard label="Giá trị trung bình" value={tienVietNam(d.giaTriTrungBinh)} foot="Mỗi hóa đơn đã thanh toán" icon={BarChart3}/>
    </div>
    <div className="bv-grid-2" style={{marginTop:10}}>
      <Card title="Nhịp doanh thu" sub="Biểu đồ minh họa 7 ngày gần nhất" right={<Badge type="gold">7 ngày</Badge>}>
        <div className="bv-bars">{[44,61,52,77,65,94,82].map((h,i)=><div className="bv-bar-wrap" key={i}><div className="bv-bar" style={{height:`${h}%`}}/><span className="bv-bar-label">{['T2','T3','T4','T5','T6','T7','CN'][i]}</span></div>)}</div>
      </Card>
      <Card title="Chất lượng vận hành" sub="Các chỉ số cần quan sát trong ca">
        {[['Tỷ lệ bàn đang dùng', d.tongSoBan ? Math.round(d.banDangPhucVu/d.tongSoBan*100) : 0, '%'],['Hóa đơn hoàn tất',d.hoaDonDaThanhToan,' hóa đơn'],['Đơn đang xử lý',Math.max(0,d.soDon-d.hoaDonDaThanhToan),' đơn']].map(([label,value,unit])=><div className="bv-info-row" key={String(label)}><span>{label}</span><strong className="bv-gold">{value}{unit}</strong></div>)}
      </Card>
    </div>
  </>;
}

export function SoDoBanView() {
  const [ban, setBan] = useState<Ban[]>([]); const [chon,setChon]=useState<Ban|null>(null); const [loading,setLoading]=useState(true); const {show,toast}=useToast();
  const tai = () => api<Ban[]>('/ban').then(ds=>{setBan(ds); if(!chon&&ds[0]) setChon(ds[0]);}).finally(()=>setLoading(false));
  useEffect(()=>{void tai();},[]);
  const doiTrangThai = async (trangThai:string) => { if(!chon)return; try{await api(`/ban/${chon.id}/trang-thai`,{method:'PATCH',body:JSON.stringify({trangThai})});show('Đã cập nhật trạng thái bàn.');await tai();}catch(e:any){show(e.message)} };
  if(loading) return <Loading/>;
  return <><PageHead title="Sơ đồ bàn" description="Theo dõi trực quan tình trạng bàn theo khu vực và điều phối phục vụ."/>
    <div className="bv-grid-4">
      <StatCard label="Tổng số bàn" value={ban.length} foot="Tất cả khu vực" icon={Table2}/><StatCard label="Đang phục vụ" value={ban.filter(x=>x.trangThai==='DANG_PHUC_VU').length} foot="Có khách tại bàn" icon={Clock3}/><StatCard label="Bàn trống" value={ban.filter(x=>x.trangThai==='TRONG').length} foot="Sẵn sàng nhận khách" icon={Table2}/><StatCard label="Đã đặt" value={ban.filter(x=>x.trangThai==='DA_DAT').length} foot="Đặt trước" icon={CalendarDays}/>
    </div>
    <div className="bv-layout-2" style={{marginTop:10}}>
      <Card title="Mặt bằng nhà hàng" sub="Chạm vào bàn để xem chi tiết">
        <div className="bv-floor">{ban.map(b=><button key={b.id} onClick={()=>setChon(b)} className={`bv-table-node ${b.trangThai==='TRONG'?'free':b.trangThai==='DA_DAT'?'reserved':b.trangThai==='CHO_DON'?'dirty':'busy'} ${chon?.id===b.id?'selected':''}`}><div className="bv-table-shape">{b.maBan}</div><small>{nhanTrangThaiBan[b.trangThai]}</small></button>)}</div>
      </Card>
      <Card title={chon?`Bàn ${chon.maBan}`:'Thông tin bàn'} sub={chon?.khuVuc}>{chon?<><div className="bv-info-list"><div className="bv-info-row"><span>Trạng thái</span><Badge type={badgeBan(chon.trangThai) as any}>{nhanTrangThaiBan[chon.trangThai]}</Badge></div><div className="bv-info-row"><span>Sức chứa</span><strong>{chon.soGhe} khách</strong></div><div className="bv-info-row"><span>Bắt đầu phục vụ</span><strong>{chon.batDauPhucVuLuc?ngayGioVietNam(chon.batDauPhucVuLuc):'—'}</strong></div></div><div className="bv-actions" style={{marginTop:18}}><button className="bv-btn small" onClick={()=>doiTrangThai('TRONG')}>Đánh dấu trống</button><button className="bv-btn small gold" onClick={()=>doiTrangThai('DANG_PHUC_VU')}>Nhận khách</button><button className="bv-btn small danger" onClick={()=>doiTrangThai('CHO_DON')}>Chờ dọn</button></div></>:<Empty text="Chọn một bàn để xem chi tiết."/>}</Card>
    </div>{toast}</>;
}

export function DatBanView() {
  const [ds,setDs]=useState<DatBan[]>([]); const [ban,setBan]=useState<Ban[]>([]); const {show,toast}=useToast();
  const [form,setForm]=useState({tenKhach:'',soDienThoai:'',soKhach:2,batDauLuc:'',banId:'',ghiChu:''});
  const tai=()=>Promise.all([api<DatBan[]>('/dat-ban'),api<Ban[]>('/ban')]).then(([d,b])=>{setDs(d);setBan(b)});
  useEffect(()=>{void tai()},[]);
  const tao=async()=>{try{await api('/dat-ban',{method:'POST',body:JSON.stringify({...form,soKhach:Number(form.soKhach),banId:form.banId||undefined,batDauLuc:new Date(form.batDauLuc).toISOString()})});show('Đã tạo lịch đặt bàn.');setForm({tenKhach:'',soDienThoai:'',soKhach:2,batDauLuc:'',banId:'',ghiChu:''});await tai()}catch(e:any){show(e.message)}};
  const checkin=async(id:string)=>{try{await api(`/dat-ban/${id}`,{method:'PATCH',body:JSON.stringify({trangThai:'DA_NHAN_BAN'})});show('Đã nhận bàn cho khách.');await tai()}catch(e:any){show(e.message)}};
  return <><PageHead title="Đặt bàn" description="Quản lý lịch đặt, bàn dự kiến và check-in khách."/>
    <div className="bv-layout-2">
      <Card title="Lịch đặt sắp tới" sub="Theo thời gian bắt đầu">{ds.length?<div className="bv-table-wrap"><table className="bv-table"><thead><tr><th>Khách</th><th>Thời gian</th><th>Bàn</th><th>Số khách</th><th>Trạng thái</th><th/></tr></thead><tbody>{ds.map(x=><tr key={x.id}><td><strong>{x.tenKhach}</strong><br/><span>{x.soDienThoai}</span></td><td>{ngayGioVietNam(x.batDauLuc)}</td><td>{x.ban?.maBan??'Chưa xếp'}</td><td>{x.soKhach}</td><td><Badge type={x.trangThai==='DA_NHAN_BAN'?'success':'gold'}>{x.trangThai.replaceAll('_',' ')}</Badge></td><td>{x.trangThai==='DA_XAC_NHAN'&&<button className="bv-btn small gold" onClick={()=>checkin(x.id)}>Nhận bàn</button>}</td></tr>)}</tbody></table></div>:<Empty text="Chưa có lịch đặt bàn."/>}</Card>
      <Card title="Tạo lịch đặt" sub="Nhập thông tin khách và bàn dự kiến"><div className="bv-field"><label>Tên khách</label><input className="bv-input" value={form.tenKhach} onChange={e=>setForm({...form,tenKhach:e.target.value})}/></div><div className="bv-grid-2"><div className="bv-field"><label>Số điện thoại</label><input className="bv-input" value={form.soDienThoai} onChange={e=>setForm({...form,soDienThoai:e.target.value})}/></div><div className="bv-field"><label>Số khách</label><input type="number" className="bv-input" value={form.soKhach} onChange={e=>setForm({...form,soKhach:Number(e.target.value)})}/></div></div><div className="bv-field"><label>Thời gian</label><input type="datetime-local" className="bv-input" value={form.batDauLuc} onChange={e=>setForm({...form,batDauLuc:e.target.value})}/></div><div className="bv-field"><label>Bàn dự kiến</label><select className="bv-select" value={form.banId} onChange={e=>setForm({...form,banId:e.target.value})}><option value="">Chưa xếp bàn</option>{ban.filter(x=>x.trangThai==='TRONG').map(b=><option key={b.id} value={b.id}>{b.maBan} · {b.soGhe} ghế</option>)}</select></div><div className="bv-field"><label>Ghi chú</label><textarea className="bv-textarea" value={form.ghiChu} onChange={e=>setForm({...form,ghiChu:e.target.value})}/></div><button className="bv-btn gold block" onClick={tao} disabled={!form.tenKhach||!form.batDauLuc}>Tạo lịch đặt</button></Card>
    </div>{toast}</>;
}

export function QuanLyThucDonView() {
  const [mon,setMon]=useState<Mon[]>([]); const [nhom,setNhom]=useState<NhomMon[]>([]); const {show,toast}=useToast();
  const [form,setForm]=useState({ten:'',nhomId:'',gia:0,moTa:'',tramBep:'BEP_NONG'});
  const tai=()=>api<{mon:Mon[];nhom:NhomMon[]}>('/thuc-don').then(r=>{setMon(r.mon);setNhom(r.nhom); if(!form.nhomId&&r.nhom[0])setForm(f=>({...f,nhomId:r.nhom[0].id}))});
  useEffect(()=>{void tai()},[]);
  const toggle=async(m:Mon)=>{try{await api(`/thuc-don/${m.id}`,{method:'PATCH',body:JSON.stringify({dangBan:!m.dangBan})});show(m.dangBan?'Đã tạm ngừng bán món.':'Đã mở bán lại món.');await tai()}catch(e:any){show(e.message)}};
  const tao=async()=>{try{await api('/thuc-don',{method:'POST',body:JSON.stringify({...form,gia:Number(form.gia)})});show('Đã thêm món mới.');setForm(f=>({...f,ten:'',gia:0,moTa:''}));await tai()}catch(e:any){show(e.message)}};
  return <><PageHead title="Quản lý thực đơn" description="Điều chỉnh món bán, giá và trạm chế biến."/>
    <div className="bv-layout-2"><Card title="Danh sách món" sub={`${mon.length} món trong thực đơn`}><div className="bv-table-wrap"><table className="bv-table"><thead><tr><th>Món</th><th>Nhóm</th><th>Giá</th><th>Trạm</th><th>Trạng thái</th><th/></tr></thead><tbody>{mon.map(m=><tr key={m.id}><td><strong>{m.ten}</strong><br/><span>{m.moTa}</span></td><td>{m.nhom?.ten}</td><td className="bv-amount">{tienVietNam(m.gia)}</td><td>{m.tramBep.replaceAll('_',' ')}</td><td><Badge type={m.dangBan?'success':'warning'}>{m.dangBan?'Đang bán':'Tạm hết'}</Badge></td><td><button className="bv-btn small" onClick={()=>toggle(m)}>{m.dangBan?'Tạm ngừng':'Mở bán'}</button></td></tr>)}</tbody></table></div></Card>
      <Card title="Thêm món mới" sub="Thông tin cơ bản của món"><div className="bv-field"><label>Tên món</label><input className="bv-input" value={form.ten} onChange={e=>setForm({...form,ten:e.target.value})}/></div><div className="bv-grid-2"><div className="bv-field"><label>Nhóm</label><select className="bv-select" value={form.nhomId} onChange={e=>setForm({...form,nhomId:e.target.value})}>{nhom.map(n=><option key={n.id} value={n.id}>{n.ten}</option>)}</select></div><div className="bv-field"><label>Giá</label><input type="number" className="bv-input" value={form.gia} onChange={e=>setForm({...form,gia:Number(e.target.value)})}/></div></div><div className="bv-field"><label>Trạm bếp</label><select className="bv-select" value={form.tramBep} onChange={e=>setForm({...form,tramBep:e.target.value})}><option value="BEP_NONG">Bếp nóng</option><option value="BEP_LANH">Bếp lạnh</option><option value="QUAY_BAR">Quầy bar</option></select></div><div className="bv-field"><label>Mô tả</label><textarea className="bv-textarea" value={form.moTa} onChange={e=>setForm({...form,moTa:e.target.value})}/></div><button className="bv-btn gold block" onClick={tao} disabled={!form.ten||!form.nhomId||form.gia<=0}>Thêm món</button></Card></div>{toast}</>;
}

export function KhoView() {
  const [ds,setDs]=useState<TonKho[]>([]); const {show,toast}=useToast(); const tai=()=>api<TonKho[]>('/kho').then(setDs); useEffect(()=>{void tai()},[]);
  const dieuChinh=async(id:string,thayDoi:number)=>{try{await api(`/kho/${id}/dieu-chinh`,{method:'PATCH',body:JSON.stringify({thayDoi})});show('Đã cập nhật tồn kho.');await tai()}catch(e:any){show(e.message)}};
  const thieu=ds.filter(x=>x.soLuong<x.mucToiThieu).length;
  return <><PageHead title="Kho nguyên liệu" description="Theo dõi tồn hiện tại và cảnh báo nguyên liệu dưới định mức."/><div className="bv-grid-4"><StatCard label="Nguyên liệu" value={ds.length} foot="Đang theo dõi" icon={PackageOpen}/><StatCard label="Cần nhập thêm" value={thieu} foot="Dưới mức tối thiểu" icon={PackageOpen}/><StatCard label="Đủ hàng" value={Math.max(0,ds.length-thieu)} foot="Trong ngưỡng an toàn" icon={PackageOpen}/><StatCard label="Cập nhật" value="Thời gian thực" foot="Sau mỗi điều chỉnh" icon={Clock3}/></div><Card title="Tồn kho hiện tại" sub="Có thể điều chỉnh nhanh ±1 đơn vị" className="" ><div className="bv-table-wrap"><table className="bv-table"><thead><tr><th>Nguyên liệu</th><th>Tồn</th><th>Tối thiểu</th><th>Trạng thái</th><th>Điều chỉnh</th></tr></thead><tbody>{ds.map(x=><tr key={x.id}><td><strong>{x.tenNguyenLieu}</strong></td><td>{x.soLuong} {x.donVi}</td><td>{x.mucToiThieu} {x.donVi}</td><td><Badge type={x.soLuong<x.mucToiThieu?'warning':'success'}>{x.soLuong<x.mucToiThieu?'Cần nhập':'Đủ hàng'}</Badge></td><td><div className="bv-actions"><button className="bv-btn small" onClick={()=>dieuChinh(x.id,-1)}>−1</button><button className="bv-btn small gold" onClick={()=>dieuChinh(x.id,1)}>+1</button></div></td></tr>)}</tbody></table></div></Card>{toast}</>;
}

export function BaoCaoView() {
  return <TongQuanView/>;
}

export function NguoiDungView() {
  const [ds,setDs]=useState<NguoiDung[]>([]); const {show,toast}=useToast(); const [form,setForm]=useState({tenDangNhap:'',hoTen:'',matKhau:'123456',vaiTro:'PHUC_VU'}); const tai=()=>api<NguoiDung[]>('/nguoi-dung').then(setDs); useEffect(()=>{void tai()},[]);
  const tao=async()=>{try{await api('/nguoi-dung',{method:'POST',body:JSON.stringify(form)});show('Đã tạo người dùng.');setForm({...form,tenDangNhap:'',hoTen:''});await tai()}catch(e:any){show(e.message)}};
  const khoa=async(u:NguoiDung)=>{try{await api(`/nguoi-dung/${u.id}`,{method:'PATCH',body:JSON.stringify({dangHoatDong:!u.dangHoatDong})});show(u.dangHoatDong?'Đã khóa tài khoản.':'Đã mở khóa tài khoản.');await tai()}catch(e:any){show(e.message)}};
  return <><PageHead title="Người dùng hệ thống" description="Tạo tài khoản, gán vai trò và khóa/mở quyền đăng nhập."/><div className="bv-layout-2"><Card title="Danh sách người dùng" sub={`${ds.length} tài khoản`}><div className="bv-table-wrap"><table className="bv-table"><thead><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Vai trò</th><th>Trạng thái</th><th/></tr></thead><tbody>{ds.map(u=><tr key={u.id}><td><strong>{u.hoTen}</strong></td><td>{u.tenDangNhap}</td><td>{u.vaiTro.replaceAll('_',' ')}</td><td><Badge type={u.dangHoatDong?'success':'danger'}>{u.dangHoatDong?'Hoạt động':'Đã khóa'}</Badge></td><td><button className={`bv-btn small ${u.dangHoatDong?'danger':''}`} onClick={()=>khoa(u)}>{u.dangHoatDong?'Khóa':'Mở khóa'}</button></td></tr>)}</tbody></table></div></Card><Card title="Tạo tài khoản" sub="Mật khẩu demo mặc định 123456" className="bv-user-create-card"><div className="bv-user-create-form"><div className="bv-field"><label>Họ tên</label><input className="bv-input" value={form.hoTen} onChange={e=>setForm({...form,hoTen:e.target.value})}/></div><div className="bv-field"><label>Tên đăng nhập</label><input className="bv-input" value={form.tenDangNhap} onChange={e=>setForm({...form,tenDangNhap:e.target.value})}/></div><div className="bv-user-create-pair"><div className="bv-field"><label>Vai trò</label><select className="bv-select" value={form.vaiTro} onChange={e=>setForm({...form,vaiTro:e.target.value})}><option value="QUAN_LY">Quản lý</option><option value="PHUC_VU">Phục vụ</option><option value="BEP">Bếp</option><option value="THU_NGAN">Thu ngân</option><option value="ADMIN">Admin</option></select></div><div className="bv-field"><label>Mật khẩu</label><input className="bv-input" value={form.matKhau} onChange={e=>setForm({...form,matKhau:e.target.value})}/></div></div><button className="bv-btn gold block bv-user-create-submit" onClick={tao} disabled={!form.hoTen||!form.tenDangNhap}>Tạo người dùng</button></div></Card></div>{toast}</>;
}

export function PhanQuyenView() {
  const rows = [
    ['Xem báo cáo doanh thu','✓','✓','—','—','R'],['Quản lý người dùng','✓','R','—','—','—'],['Quản lý bàn','✓','✓','O','—','R'],['Tạo đơn','✓','✓','✓','—','O'],['Chế biến KDS','R','R','—','✓','R'],['Thanh toán','✓','✓','—','—','✓'],['Quản lý kho','✓','✓','—','R','—'],['Hủy/void nhạy cảm','✓','✓','A','A','A'],
  ];
  return <><PageHead title="Phân quyền RBAC" description="Ma trận quyền theo vai trò. Quyền thực tế được kiểm tra ở API, không chỉ ẩn nút trên giao diện."/><Card title="Ma trận quyền" sub="✓ toàn quyền · R chỉ đọc · O theo phạm vi · A cần phê duyệt · — không truy cập"><div style={{overflow:'auto'}}><div className="bv-permission-grid">{['Chức năng','Admin','Quản lý','Phục vụ','Bếp','Thu ngân'].map(x=><div key={x} className="head">{x}</div>)}{rows.flatMap((r,i)=>r.map((x,j)=><div key={`${i}-${j}`} className={j&&x==='✓'?'bv-check':j&&x==='—'?'bv-no':''}>{x}</div>))}</div></div></Card></>;
}

export function CaiDatView() {
  return <><PageHead title="Cài đặt hệ thống" description="Cấu hình cơ bản cho chi nhánh và trải nghiệm giao diện."/><div className="bv-grid-2"><Card title="Thông tin nhà hàng" sub="Thông tin mẫu cho mã nguồn"><div className="bv-info-row"><span>Tên thương hiệu</span><strong>Bếp Việt</strong></div><div className="bv-info-row"><span>Chi nhánh</span><strong>Trung tâm</strong></div><div className="bv-info-row"><span>Tiền tệ</span><strong>VND</strong></div><div className="bv-info-row"><span>Múi giờ</span><strong>Asia/Ho_Chi_Minh</strong></div></Card><Card title="Trạng thái tính năng" sub="Các chức năng đã có trong mã nguồn"><div className="bv-info-row"><span>Tối / Sáng</span><Badge type="success">Đã bật</Badge></div><div className="bv-info-row"><span>Màn hình bếp thời gian thực</span><Badge type="success">Đã bật</Badge></div><div className="bv-info-row"><span>Đăng nhập và phân quyền</span><Badge type="success">Đã bật</Badge></div><div className="bv-info-row"><span>Cổng thanh toán thật</span><Badge type="warning">Mô phỏng</Badge></div></Card></div></>;
}
