'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChefHat, Clock3, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { api, tienVietNam } from '@/lib/api';
import type { Don, Mon, NhomMon } from '@/lib/types';
import { Badge, Card, Empty, Loading, PageHead, useToast } from '@/components/ui';

const CART_KEY='bep-viet-khach-gio';
const ORDER_KEY='bep-viet-khach-ma-don';

function useGuestCart(){
  const [gio,setGioState]=useState<Record<string,number>>({});
  useEffect(()=>{try{setGioState(JSON.parse(localStorage.getItem(CART_KEY)??'{}'))}catch{}},[]);
  const setGio=(next:Record<string,number>)=>{setGioState(next);localStorage.setItem(CART_KEY,JSON.stringify(next))};
  return {gio,setGio};
}

export function GuestMenuView(){
  const router=useRouter();const search=useSearchParams();const maBan=search.get('ban')??'B02';const [mon,setMon]=useState<Mon[]>([]);const [nhom,setNhom]=useState<NhomMon[]>([]);const [chon,setChon]=useState('Tất cả');const [loading,setLoading]=useState(true);const {gio,setGio}=useGuestCart();
  useEffect(()=>{api<{mon:Mon[];nhom:NhomMon[]}>('/thuc-don').then(r=>{setMon(r.mon);setNhom(r.nhom)}).finally(()=>setLoading(false))},[]);if(loading)return <Loading/>;
  const visible=mon.filter(m=>m.dangBan&&(chon==='Tất cả'||m.nhom?.ten===chon));const tong=(Object.entries(gio) as Array<[string,number]>).reduce((s,[id,q])=>s+(mon.find(m=>m.id===id)?.gia??0)*q,0);const tang=(id:string)=>setGio({...gio,[id]:(gio[id]??0)+1});
  return <><PageHead title="Thực đơn Bếp Việt" description={`Menu QR tại bàn ${maBan} · Chọn món và gửi trực tiếp đến bếp.`}/><div className="bv-mobile-shell"><div className="bv-mobile-hero"><div className="bv-kicker">BẾP VIỆT · BÀN {maBan}</div><h2>Hôm nay mình ăn gì?</h2><div style={{color:'#b9b3a7',fontSize:12}}>Món Việt hiện đại, phục vụ ngay tại bàn.</div></div><div className="bv-mobile-body"><div className="bv-filter-row"><button className={`bv-chip ${chon==='Tất cả'?'active':''}`} onClick={()=>setChon('Tất cả')}>Tất cả</button>{nhom.map(n=><button key={n.id} className={`bv-chip ${chon===n.ten?'active':''}`} onClick={()=>setChon(n.ten)}>{n.ten}</button>)}</div><div className="bv-mobile-menu">{visible.map(m=><article className="bv-food" key={m.id}><div className="bv-food-img"><img src={m.hinhAnh||'/menu/pho-bo.svg'} alt={m.ten}/></div><div className="bv-food-body"><div className="bv-food-name">{m.ten}</div><div className="bv-food-bottom"><span className="bv-price">{tienVietNam(m.gia)}</span><button className="bv-plus" onClick={()=>tang(m.id)}>+</button></div></div></article>)}</div><button className="bv-btn gold block bv-sticky-cart" onClick={()=>router.push(`/khach/gio-hang?ban=${maBan}`)}><ShoppingBag size={17}/>Giỏ hàng · {tienVietNam(tong)}</button></div></div></>;
}

export function GuestCartView(){
  const router=useRouter();const search=useSearchParams();const maBan=search.get('ban')??'B02';const [mon,setMon]=useState<Mon[]>([]);const {gio,setGio}=useGuestCart();const [ghiChu,setGhiChu]=useState('');const {show,toast}=useToast();useEffect(()=>{api<{mon:Mon[]}>('/thuc-don').then(r=>setMon(r.mon))},[]);
  const items=(Object.entries(gio) as Array<[string,number]>).filter(([,q])=>q>0).map(([id,q])=>({m:mon.find(x=>x.id===id),q})).filter(x=>x.m) as Array<{m:Mon;q:number}>;const tong=items.reduce((s,x)=>s+x.m.gia*x.q,0);const doi=(id:string,n:number)=>{const next={...gio,[id]:Math.max(0,(gio[id]??0)+n)};setGio(next)};
  const dat=async()=>{try{const don=await api<Don>('/khach/don-hang',{method:'POST',body:JSON.stringify({maBan,chiTiet:items.map(x=>({monId:x.m.id,soLuong:x.q})),ghiChu})});localStorage.setItem(ORDER_KEY,don.maDon);setGio({});show('Đơn đã được gửi đến bếp.');setTimeout(()=>router.push(`/khach/theo-doi?ban=${maBan}`),600)}catch(e:any){show(e.message)}};
  return <><PageHead title="Giỏ hàng" description={`Kiểm tra món trước khi gửi xuống bếp · Bàn ${maBan}`}/><div className="bv-mobile-shell"><div className="bv-mobile-body" style={{padding:18}}>{items.length?items.map(({m,q})=><div className="bv-cart-line" key={m.id}><div><div className="bv-cart-name">{m.ten}</div><div className="bv-cart-meta">{tienVietNam(m.gia)} / phần</div></div><div className="bv-qty"><button onClick={()=>doi(m.id,-1)}>−</button>{q}<button onClick={()=>doi(m.id,1)}>+</button></div></div>):<Empty text="Giỏ hàng đang trống."/>}<div className="bv-field"><label>Ghi chú chung</label><textarea className="bv-textarea" value={ghiChu} onChange={e=>setGhiChu(e.target.value)} placeholder="Ví dụ: ít cay, không hành…"/></div><div className="bv-total"><span>Tạm tính</span><strong>{tienVietNam(tong)}</strong></div><button className="bv-btn gold block" disabled={!items.length} onClick={dat}>Đặt món ngay</button></div></div>{toast}</>;
}

export function GuestTrackingView(){
  const [don,setDon]=useState<Don|null>(null);const [loading,setLoading]=useState(true);const maDon=typeof window==='undefined'?'':localStorage.getItem(ORDER_KEY)??'';
  useEffect(()=>{const code=localStorage.getItem(ORDER_KEY);if(!code){setLoading(false);return}const tai=()=>api<Don>(`/khach/don-hang/${code}`).then(setDon).finally(()=>setLoading(false));void tai();const timer=setInterval(tai,5000);return()=>clearInterval(timer)},[]);
  if(loading)return <Loading/>;if(!don)return <><PageHead title="Theo dõi đơn" description="Trạng thái đơn QR của bạn."/><Empty text="Chưa có đơn QR nào trên thiết bị này."/></>;
  const steps=[['DA_GUI_BEP','Bếp đã nhận đơn',ChefHat],['DANG_CHE_BIEN','Đang chế biến',Clock3],['SAN_SANG','Món đã sẵn sàng',CheckCircle2],['DA_PHUC_VU','Đã mang ra bàn',UtensilsCrossed]] as const;const order=['DA_GUI_BEP','DANG_CHE_BIEN','SAN_SANG','DA_PHUC_VU','DA_THANH_TOAN'];const current=order.indexOf(don.trangThai);
  return <><PageHead title="Theo dõi đơn" description={`${don.maDon} · Bàn ${don.ban?.maBan}`}/><div className="bv-mobile-shell"><div className="bv-mobile-hero"><div className="bv-kicker">THEO DÕI ĐƠN HÀNG</div><h2>Món ngon đang đến.</h2><div style={{color:'#b9b3a7',fontSize:12}}>{don.chiTiet.length} dòng món trong đơn</div></div><div className="bv-mobile-body" style={{padding:18}}>{steps.map(([status,label,Icon],i)=><div className="bv-info-row" key={status}><span style={{display:'flex',gap:10,alignItems:'center'}}><Icon size={18}/>{label}</span>{current>=i?<Badge type="success">Hoàn tất</Badge>:<Badge type="neutral">Đang chờ</Badge>}</div>)}<div style={{marginTop:18}}><Card title="Món đã gọi" sub="Chi tiết đơn">{don.chiTiet.map(x=><div className="bv-info-row" key={x.id}><span>{x.soLuong}× {x.mon.ten}</span><strong>{tienVietNam(x.donGia*x.soLuong)}</strong></div>)}</Card></div></div></div></>;
}
