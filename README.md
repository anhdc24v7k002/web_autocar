# Auto Car - Website Cho Thuê Xe Ô Tô

Project gồm 2 phần:

- `backend`: Node.js, Express, MongoDB, Mongoose, JWT
- `frontend`: Vue 3, Vite, Vue Router, Axios

## 1. Chạy MongoDB

Nếu dùng MongoDB local, mở MongoDB Compass và tạo kết nối:

```bash
mongodb://127.0.0.1:27017
```

Database sẽ tự tạo tên là `auto_car`.

## 2. Chạy Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend chạy tại:

```bash
http://localhost:5000
```

## 3. Chạy Frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```bash
http://localhost:5173
```

## 4. Chức năng đã có

- Trang chủ Auto Car
- Đăng ký tài khoản
- Đăng nhập bằng JWT
- Đăng xuất
- Danh sách xe
- Chi tiết xe
- Thuê xe
- Kiểm tra trùng lịch thuê xe
- Tình trạng xe đã thuê của người dùng
- Lịch thuê/lịch trống của các xe
- Trang liên hệ
- Lưu dữ liệu vào MongoDB

## 5. API chính

### Auth

```bash
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Cars

```bash
GET  /api/cars
GET  /api/cars/:id
POST /api/cars
```

### Rentals

```bash
POST /api/rentals
GET  /api/rentals/my-rentals
GET  /api/rentals/schedule
GET  /api/rentals/all
```

### Contact

```bash
POST /api/contacts
```
