# BẾP VIỆT POS — Báo cáo nghiên cứu, thiết kế UI/UX và tài liệu chuyển giao phát triển

> **Phiên bản source code:** 1.0.0  
> **Ngôn ngữ giao diện:** 100% tiếng Việt  
> **Phong cách:** Fine Dining / Luxury SaaS — Đen, vàng champagne, ivory  
> **Chế độ hiển thị:** Dark / Light  
> **Kiến trúc:** Next.js + NestJS + PostgreSQL + TypeORM + Socket.IO  
> **Múi giờ nghiệp vụ:** Asia/Ho_Chi_Minh · **Tiền tệ:** VND

---

## 1. Mục tiêu dự án

**Bếp Việt POS** được thiết kế như một nền tảng vận hành nhà hàng, không phải một dashboard dùng chung rồi đổi tên menu theo chức vụ. Sáu vai trò có chung design system và dữ liệu, nhưng mật độ thông tin và cách thao tác khác nhau:

| Vai trò | Mục tiêu UX | Thiết bị ưu tiên |
|---|---|---|
| **Admin** | Tài khoản, phân quyền, cấu hình, giám sát | Desktop |
| **Quản lý** | KPI, sơ đồ bàn, booking, thực đơn, kho, báo cáo | Desktop / Tablet |
| **Phục vụ** | Bàn → chọn món → ghi chú → gửi bếp → mang món | Tablet / Mobile |
| **Bếp** | Nhận ticket → chế biến → hoàn tất | Tablet lớn / KDS |
| **Thu ngân** | Hóa đơn → phương thức → xác nhận → đối soát | POS Desktop / Tablet |
| **Khách hàng** | QR → menu → giỏ → đặt món → theo dõi | Mobile |

Luồng nghiệp vụ cốt lõi:

```text
Khách / Phục vụ
      ↓
    BÀN
      ↓
  GỌI MÓN
      ↓ realtime
    KDS BẾP
      ↓
SẴN SÀNG PHỤC VỤ
      ↓
 PHỤC VỤ MANG MÓN
      ↓
   THU NGÂN
      ↓
  THANH TOÁN
      ↓
 BÀN CHỜ DỌN → TRỐNG
```

---

## 2. Kết quả nghiên cứu nghiệp vụ

Các hệ thống POS nhà hàng thực tế thường hội tụ quanh các nhóm tính năng: sơ đồ bàn, gọi món tại bàn, KDS, menu, tồn kho, thanh toán, booking, nhân sự/phân quyền và báo cáo. Bếp Việt POS áp dụng các pattern đó theo cách riêng, tập trung vào **độ rõ của trạng thái và giảm số bước thao tác**.

### 2.1. Nguyên tắc nghiệp vụ

1. **Table Session / Order là trung tâm**, không phải từng trang rời rạc.
2. Trạng thái bàn và đơn hàng phải có state machine rõ ràng.
3. Mỗi vai trò chỉ nhìn thấy hành động hợp lệ tiếp theo.
4. Quyền phải được kiểm tra ở **backend**; frontend chỉ là lớp trình bày.
5. Thanh toán là mutation nhạy cảm, phải thực hiện trong transaction và chống double-submit.
6. KDS phải ưu tiên khả năng đọc nhanh hơn trang trí.
7. Menu QR của khách phải ưu tiên hình ảnh, giá và CTA giỏ hàng.
8. Realtime dùng cho order/status/table để các bộ phận không phải refresh thủ công.

### 2.2. State machine

```text
Bàn:
TRỐNG → ĐÃ ĐẶT → ĐANG PHỤC VỤ → CHỜ THANH TOÁN → CHỜ DỌN → TRỐNG

Đơn:
NHÁP → ĐÃ GỬI BẾP → ĐANG CHẾ BIẾN → SẴN SÀNG → ĐÃ PHỤC VỤ → ĐÃ THANH TOÁN
                       ↘ HỦY (theo quyền)

Đặt bàn:
CHỜ XÁC NHẬN → ĐÃ XÁC NHẬN → ĐÃ NHẬN BÀN
                         ↘ VẮNG MẶT / HỦY
```

Trong source hiện tại, backend kiểm tra chuyển trạng thái hợp lệ của đơn hàng. Ví dụ, không thể chuyển trực tiếp `ĐANG CHẾ BIẾN → ĐÃ THANH TOÁN`.

---

## 3. Design System đen–vàng

### 3.1. Dark mode

| Token | Màu | Mục đích |
|---|---|---|
| Background | `#0B0B0D` | Nền ứng dụng |
| Deep background | `#070708` | Nền sâu |
| Surface | `#141417` | Card / sidebar |
| Elevated | `#1C1C20` | Input / card nổi |
| Gold | `#D4AF37` | Brand / CTA |
| Gold bright | `#F1D878` | Focus / highlight |
| Primary text | `#F5F1E8` | Chữ chính |
| Secondary text | `#C7C0B3` | Chữ phụ |
| Success | `#53C79B` | Sẵn sàng / thanh toán |
| Warning | `#E4A45A` | Đang làm / chú ý |
| Danger | `#EF7878` | Lỗi / chờ dọn / khóa |

### 3.2. Light mode

Light mode không đảo màu cơ học. Nền dùng ivory và vàng tối hơn để giữ độ tương phản:

```css
--bg: #F5F1E8;
--surface: #FFFDF8;
--text: #191711;
--gold: #9C751C;
--gold-2: #BD8E25;
```

Nút gold luôn dùng chữ rất tối thay vì chữ trắng. Trạng thái luôn có **màu + chữ**, không chỉ dựa vào màu.

### 3.3. Typography

- Hero/brand: serif hệ thống (`Georgia`, `ui-serif`) để tạo cảm giác fine dining.
- Vận hành: sans-serif hệ thống để đọc nhanh.
- Currency: tabular numerals để số tiền thẳng cột.
- Touch target chính: khoảng 44px trở lên.

---

## 4. Cấu trúc thư mục

```text
bep-viet-pos/
├── README.md
├── package.json                 # NPM workspaces
├── .env.example
├── docker-compose.yml           # PostgreSQL local
│
├── apps/
│   ├── web/                     # Next.js 16 App Router
│   │   ├── app/
│   │   │   ├── globals.css      # Design tokens Dark/Light + toàn bộ UI style
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dang-nhap/
│   │   │   │   └── page.tsx
│   │   │   └── [vaiTro]/[trang]/
│   │   │       └── page.tsx     # Dynamic route cho 6 workspace
│   │   ├── components/
│   │   │   ├── AppShell.tsx
│   │   │   ├── RolePage.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ui.tsx
│   │   │   └── views/
│   │   │       ├── AdminManagerViews.tsx
│   │   │       ├── WaiterViews.tsx
│   │   │       ├── KitchenCashierViews.tsx
│   │   │       └── GuestViews.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── navigation.ts
│   │   │   └── types.ts
│   │   └── public/menu/         # Ảnh SVG demo món ăn
│   │
│   └── api/                     # NestJS REST + Socket.IO
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── entities.ts      # Entity + enum nghiệp vụ
│       │   ├── seed.ts
│       │   ├── auth/
│       │   ├── users/
│       │   ├── tables/
│       │   ├── menu/
│       │   ├── orders/
│       │   ├── kitchen/
│       │   ├── payments/
│       │   ├── bookings/
│       │   ├── inventory/
│       │   ├── reports/
│       │   ├── realtime/
│       │   ├── health/
│       │   └── common/
│       │       ├── decorators/
│       │       └── guards/
│       └── .env.example
│
└── packages/
    └── shared/                  # Enum/type dùng chung
```

### Quy ước cấu trúc

- `views/`: màn hình nghiệp vụ, không chứa code kết nối DB.
- `lib/api.ts`: lớp giao tiếp API duy nhất của frontend.
- `entities.ts`: mô hình dữ liệu backend.
- Mỗi module backend có controller/service riêng khi nghiệp vụ đủ phức tạp.
- `RealtimeGateway`: một điểm phát Socket.IO event dùng chung.
- Hàm/biến nghiệp vụ quan trọng có comment tiếng Việt trong source.

---

## 5. Sitemap 6 vai trò

```text
BẾP VIỆT POS
├── Đăng nhập
├── Admin
│   ├── Tổng quan
│   ├── Người dùng
│   ├── Phân quyền
│   └── Cài đặt
├── Quản lý
│   ├── Tổng quan
│   ├── Sơ đồ bàn
│   ├── Đặt bàn
│   ├── Thực đơn
│   ├── Kho nguyên liệu
│   └── Báo cáo
├── Phục vụ
│   ├── Sơ đồ bàn
│   ├── Gọi món / POS
│   └── Theo dõi món
├── Bếp
│   ├── KDS
│   └── Đã hoàn thành
├── Thu ngân
│   ├── Hóa đơn
│   ├── Thanh toán
│   └── Lịch sử giao dịch
└── Khách hàng
    ├── Thực đơn QR
    ├── Giỏ hàng
    └── Theo dõi đơn
```

---

## 6. Các chức năng đã có trong source

### Admin

- Đăng nhập JWT.
- Xem dashboard vận hành.
- Xem danh sách tài khoản.
- Tạo tài khoản nhân viên.
- Gán vai trò.
- Khóa/mở tài khoản.
- Xem ma trận RBAC.
- Xem trạng thái tính năng.

### Quản lý

- KPI doanh thu / đơn / công suất bàn.
- Sơ đồ 18 bàn, nhiều trạng thái.
- Chọn bàn, nhận khách, trả bàn trống, đánh dấu chờ dọn.
- Tạo booking và check-in.
- Xem/sửa trạng thái món, mở bán/tạm hết.
- Thêm món mới.
- Theo dõi và điều chỉnh tồn kho.
- Báo cáo tổng quan lấy từ giao dịch thật trong DB.

### Phục vụ

- Chọn bàn từ sơ đồ.
- POS menu theo nhóm.
- Thêm/bớt số lượng món.
- Ghi chú đơn.
- Gửi đơn xuống bếp.
- Theo dõi trạng thái realtime.
- Xác nhận “Đã mang món”.

### Bếp

- KDS 3 cột: Đơn mới / Đang chế biến / Hoàn thành.
- Timer theo phút.
- Hiện ghi chú món/đơn.
- Bắt đầu chế biến.
- Hoàn thành món.
- Realtime khi phục vụ/khách tạo order.
- Lịch sử ticket hoàn thành.

### Thu ngân

- Hàng đợi hóa đơn.
- Tính tổng tiền ở backend.
- Chọn tiền mặt / QR / thẻ.
- Transaction + pessimistic lock khi thanh toán.
- Đánh dấu đơn đã thanh toán và bàn chờ dọn.
- Lịch sử giao dịch.

### Khách hàng

- Menu QR mobile-first.
- Nhóm món / quick add.
- Giỏ hàng lưu localStorage.
- Ghi chú đơn.
- Gửi đơn QR công khai theo mã bàn.
- Theo dõi trạng thái đơn theo mã đơn.

### Toàn hệ thống

- Dark / Light mode, lưu lựa chọn ở localStorage.
- Layout responsive desktop / tablet / mobile.
- API validation bằng `class-validator`.
- JWT guard và role guard.
- Socket.IO realtime.
- PostgreSQL.
- Seed dữ liệu demo.
- Health check endpoint.

---

## 7. Phân quyền RBAC

| Chức năng | Admin | Quản lý | Phục vụ | Bếp | Thu ngân |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | — | — | — |
| Người dùng | ✓ | R | — | — | — |
| Sơ đồ bàn | ✓ | ✓ | O | — | R |
| Đặt bàn | ✓ | ✓ | O | — | R |
| Quản lý thực đơn | ✓ | ✓ | R | Availability | R |
| Kho | ✓ | ✓ | — | R | — |
| Tạo order | ✓ | ✓ | ✓ | — | O |
| KDS | R | R | R | ✓ | R |
| Ready → Served | — | ✓ | ✓ | R | R |
| Thanh toán | ✓ | ✓ | — | — | ✓ |
| Báo cáo | ✓ | ✓ | — | — | R |

`O` = trong phạm vi bàn/order được giao; `R` = chỉ đọc.

> Source demo hiện enforce các quyền chính bằng `@VaiTro(...)` và `RolesGuard`. Khi triển khai multi-branch thực tế, bổ sung object-level authorization theo `branchId/tableId/orderId`.

---

## 8. API chính

Prefix:

```text
/api/v1
```

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/auth/dang-nhap` | Đăng nhập JWT |
| GET | `/auth/toi` | Phiên hiện tại |
| GET | `/ban` | Danh sách bàn |
| PATCH | `/ban/:id/trang-thai` | Đổi trạng thái bàn |
| GET | `/thuc-don` | Menu công khai |
| POST | `/thuc-don` | Tạo món |
| PATCH | `/thuc-don/:id` | Cập nhật món/availability |
| GET | `/don-hang` | Danh sách đơn |
| POST | `/don-hang` | Nhân viên tạo đơn |
| PATCH | `/don-hang/:id/trang-thai` | Chuyển trạng thái |
| POST | `/khach/don-hang` | Khách QR tạo đơn |
| GET | `/khach/don-hang/:maDon` | Khách theo dõi đơn |
| GET | `/bep/kds` | Queue KDS |
| PATCH | `/bep/:id/bat-dau` | Bắt đầu chế biến |
| PATCH | `/bep/:id/hoan-thanh` | Hoàn thành |
| GET | `/thanh-toan/cho-thanh-toan` | Queue thu ngân |
| POST | `/thanh-toan/:donId` | Thanh toán |
| GET | `/thanh-toan/lich-su` | Lịch sử giao dịch |
| GET/POST/PATCH | `/dat-ban` | Booking |
| GET | `/kho` | Tồn kho |
| PATCH | `/kho/:id/dieu-chinh` | Điều chỉnh kho |
| GET | `/bao-cao/tong-quan` | KPI |
| GET/POST/PATCH | `/nguoi-dung` | Quản lý tài khoản |
| GET | `/suc-khoe` | Health check |

---

## 9. Realtime event

Namespace:

```text
/realtime
```

Event hiện dùng:

```text
don-hang.tao
don-hang.trang-thai.thay-doi
don-hang.chuyen-ban
ban.trang-thai.thay-doi
ban.chuyen
thuc-don.thay-doi
thanh-toan.hoan-tat
```

Frontend phục vụ và KDS tự refresh dữ liệu khi nhận event liên quan.

---

## 10. Mô hình dữ liệu

Các entity chính:

```text
NguoiDung
BanNhaHang
NhomMon
MonAn
DonHang
ChiTietDon
ThanhToan
DatBan
TonKho
CaLamViec
NhatKyHeThong
```

Quan hệ lõi:

```text
BanNhaHang 1 ─── n DonHang
DonHang    1 ─── n ChiTietDon n ─── 1 MonAn
DonHang    1 ─── n ThanhToan
NhomMon    1 ─── n MonAn
BanNhaHang 1 ─── n DatBan
NguoiDung  1 ─── n DonHang
```

Giá món và tiền thanh toán lưu bằng **integer VND** thay vì floating point.

---

## 11. Cài đặt và chạy local

### Yêu cầu

- Node.js 22+
- npm 10+
- Docker Desktop hoặc PostgreSQL 16+

### Bước 1 — sao chép biến môi trường

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### Bước 2 — chạy PostgreSQL

```bash
docker compose up -d
```

### Bước 3 — cài dependency

```bash
npm install
```

### Bước 4 — seed dữ liệu

TypeORM được cấu hình `synchronize: true` trong development; lệnh seed sẽ tạo bảng và dữ liệu demo.

```bash
npm run db:seed
```

### Bước 5 — chạy frontend + backend

Mở hai terminal:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Truy cập:

```text
http://localhost:3000
```

API:

```text
http://localhost:4000/api/v1/suc-khoe
```

---

## 12. Tài khoản demo

Mật khẩu cho tất cả tài khoản:

```text
123456
```

| Vai trò | Tài khoản |
|---|---|
| Admin | `admin` |
| Quản lý | `quanly` |
| Phục vụ | `phucvu` |
| Bếp | `bep` |
| Thu ngân | `thungan` |

Khách hàng không cần đăng nhập:

```text
http://localhost:3000/khach/thuc-don?ban=B02
```

---

## 13. Ghi chú hàm và biến

Source chủ động dùng các tên hàm/biến **không dấu nhưng tiếng Việt** để:

- dễ đọc với sinh viên/người phát triển Việt Nam;
- tránh lỗi encoding/tooling;
- vẫn giữ semantic nghiệp vụ.

Ví dụ:

```ts
// Tạo đơn và đồng thời đưa bàn sang trạng thái đang phục vụ.
async taoDon(...) { ... }

// Tính tiền trên server, tuyệt đối không tin tổng tiền do frontend gửi lên.
private tinhTongDon(...) { ... }

// Phát sự kiện nghiệp vụ tới tất cả màn hình đang mở.
phat(tenSuKien, duLieu) { ... }
```

Không comment từng dòng hiển nhiên; comment tập trung vào **lý do nghiệp vụ, security và concurrency**.

---

## 14. Security baseline

Bản source đã có:

- Password hash bằng bcrypt.
- JWT access token.
- Backend RBAC guard.
- DTO validation.
- Thanh toán tính lại số tiền ở server.
- Transaction + pessimistic lock khi thanh toán.
- Không render raw HTML từ ghi chú khách.

Production cần bổ sung:

- Refresh token dạng Secure + HttpOnly cookie.
- Rotate/revoke session.
- Rate limit login và public QR endpoints.
- CSRF protection nếu dùng cookie credentials cho mutation.
- Audit log cho discount/void/refund/permission changes.
- Multi-branch object-level authorization.
- Secret manager thay vì `.env` thủ công.
- HTTPS bắt buộc.
- Migration database thay cho `synchronize`.

---

## 15. Accessibility

Mục tiêu thiết kế: WCAG 2.2 AA.

- Chữ chính có tương phản cao ở cả Dark/Light.
- Gold button dùng chữ đen.
- Focus keyboard có outline vàng rõ.
- Trạng thái có chữ + màu.
- Target thao tác chính khoảng 44px.
- Responsive và có bottom navigation trên mobile.

---

## 16. Chức năng production nên nối tiếp

Source hiện tại là **full core workflow có thể chạy** cho đồ án/prototype và là nền tốt để triển khai production. Những phần phụ thuộc nhà cung cấp/hạ tầng thực tế được để thành extension point thay vì giả lập là “đã chạy thật”:

1. Cổng thanh toán QR/ngân hàng thật và webhook.
2. Máy POS/thẻ vật lý.
3. In nhiệt ESC/POS và print agent LAN.
4. Hóa đơn điện tử theo nhà cung cấp cụ thể.
5. Multi-branch hoàn chỉnh.
6. Approval center cho void/refund/discount vượt ngưỡng.
7. Split bill nâng cao theo món/người/tỷ lệ.
8. Chốt ca tiền mặt và đối soát két.
9. Audit log before/after cho toàn bộ mutation nhạy cảm.
10. Offline queue cho thiết bị phục vụ.

Các mục trên không thể được coi là “hoàn tất production” nếu chưa có thông tin nhà cung cấp, thiết bị và chính sách vận hành thật.

---

## 17. Tài liệu tham khảo nghiên cứu

Các pattern nghiệp vụ và kỹ thuật được đối chiếu với tài liệu công khai của:

- KiotViet F&B: quản lý bàn/order/QR.
- iPOS: QR menu, PDA gọi món tại bàn, hệ sinh thái F&B.
- MISA CUKCUK: nghiệp vụ chuyển/gộp/tách và kiểm soát thao tác.
- Toast / Square / Oracle / Lightspeed: KDS, floor plan, tableside ordering, billing.
- Next.js App Router documentation.
- NestJS authentication/authorization/WebSocket documentation.
- PostgreSQL transaction/locking documentation.
- OWASP Top 10 / API Security Top 10.
- W3C WCAG 2.2.

URL tham khảo chính:

```text
https://nextjs.org/docs/app
https://docs.nestjs.com/
https://www.postgresql.org/docs/current/explicit-locking.html
https://owasp.org/API-Security/
https://www.w3.org/WAI/WCAG22/Understanding/
https://www.kiotviet.vn/
https://ipos.vn/
https://helpv2.cukcuk.vn/
https://support.toasttab.com/
https://squareup.com/us/en/point-of-sale/restaurants/kitchen-display-system
https://www.oracle.com/food-beverage/
https://www.lightspeedhq.com/pos/restaurant/
```

---

## 18. Checklist chuyển giao

- [x] Cấu trúc monorepo rõ ràng.
- [x] 6 vai trò.
- [x] Tiếng Việt toàn bộ giao diện.
- [x] Dark / Light mode.
- [x] Responsive.
- [x] JWT + RBAC.
- [x] PostgreSQL data model.
- [x] Seed demo.
- [x] Sơ đồ bàn.
- [x] Booking.
- [x] Menu management.
- [x] Kho.
- [x] Waiter POS.
- [x] KDS realtime.
- [x] Checkout transaction.
- [x] Lịch sử giao dịch.
- [x] Guest QR menu/cart/tracking.
- [x] Báo cáo KPI.
- [x] README nghiên cứu + handoff.
- [ ] Payment gateway thật.
- [ ] ESC/POS print agent.
- [ ] Hóa đơn điện tử thật.
- [ ] Production migrations / observability / deployment hardening.

---

## 19. Lưu ý triển khai production

Trong development, TypeORM đang dùng:

```ts
synchronize: true
```

**Không dùng tùy chọn này ở production.** Hãy chuyển sang migration có version, backup database và quy trình rollback.

Cấu trúc hiện tại cố ý là **modular monolith**. Với quy mô một hoặc vài chi nhánh, đây là lựa chọn dễ kiểm thử và vận hành hơn việc chia microservices quá sớm. Khi cần scale realtime nhiều instance, bổ sung Redis adapter cho Socket.IO và tách worker cho print/webhook/job.

---

**Bếp Việt POS — Luxury restaurant operations, thiết kế cho tốc độ vận hành nhưng vẫn giữ cảm giác thương hiệu cao cấp.**
