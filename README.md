# CNPMM Backend - Hệ Thống Quản Lý Sinh Viên & Lịch Thi

Dự án Backend cung cấp các RESTful API phục vụ quản lý, tra cứu thông tin sinh viên, ca thi, phòng thi và xác thực quản trị viên (Admin).

---

## 🛠️ Tech Stack

- **Runtime & Ngôn ngữ**: Node.js (ES Module), TypeScript (v5.8+)
- **Framework Web**: Express.js (v5.1)
- **Cơ sở dữ liệu & ODM**: MongoDB, Mongoose (v8.16)
- **Xác thực & Bảo mật**: JSON Web Token (`jsonwebtoken`), Hashing mật khẩu (`bcryptjs`), `cors`
- **Công cụ Build & Phát triển**: `tsup` (Bundler & Live Reload), `dotenv` (Quản lý biến môi trường)
- **HTTP Client**: Axios

---

## 🚀 Cách Chạy Dự Án

### 1. Yêu cầu tiền đề

- **Node.js** (Phiên bản LTS khuyến nghị, >= 18.x)
- **MongoDB** Server (chạy local hoặc kết nối MongoDB Atlas)

### 2. Cấu hình biến môi trường (`.env`)

Tạo hoặc kiểm tra file `.env` tại thư mục gốc của dự án với các cấu hình tương tự bên dưới:

```env
PORT=5000
URL=mongodb://localhost:27017
DATABASE_NAME=student_management_db
JWT_SECRET=your_secret_key_here
```

### 3. Cài đặt các thư viện phụ thuộc

Chạy lệnh sau trong terminal để cài đặt các package cần thiết:

```bash
npm install
```

### 4. Các lệnh khởi chạy dự án

- **Khởi chạy môi trường phát triển (Development):**

  ```bash
  npm run dev
  ```

  _(Sử dụng `tsup` với chế độ watch tự động build lại và khởi chạy server tại `http://localhost:5000`)_

- **Biên dịch dự án (Build):**

  ```bash
  npm run build
  ```

  _(Biên dịch TypeScript sang JavaScript trong thư mục `dist/`)_

- **Chạy môi trường sản xuất (Production):**
  ```bash
  npm start
  ```
  _(Khởi chạy ứng dụng từ file đã biên dịch `dist/server.js`)_

---

## 📋 Danh Sách Tính Năng Đã Làm

### 1. Xác thực & Phân quyền (Authentication & Authorization)

- **Đăng nhập Quản trị viên (Admin Login):** `POST /api/auth/login`
  - Đăng nhập hệ thống bằng `username` và `password`.
  - Mã hóa và đối soát mật khẩu bảo mật với `bcryptjs`.
  - Cấp phát mã xác thực **JWT Token** (thời hạn 4h).
- **Middleware Xác thực:** `authenticateToken`
  - Kiểm tra tính hợp lệ của JWT Bearer Token trong Header (`Authorization: Bearer <token>`) trước khi cho phép truy cập các endpoint sinh viên.

### 2. Quản lý & Tra cứu Sinh viên, Lịch thi (Student & Exam Session Management)

- **Lấy danh sách khu vực thi theo ngày:** `GET /api/students/search/:date/areas`
  - Trả về danh sách các khu vực thi có ca thi trong ngày (định dạng `YYYY-MM-DD`).
- **Lấy danh sách ca thi & phòng thi theo ngày và khu vực:** `GET /api/students/search/:date/:area/shifts`
  - Trả về danh sách các ca thi và các phòng thi tương ứng theo ngày và khu vực.
- **Tra cứu danh sách sinh viên trong phòng thi:** `GET /api/students/search/:date/:area/:shift/:room/students`
  - Trả về danh sách sinh viên, tên môn thi và tổng số sinh viên tham gia thi theo ngày, khu vực, ca thi và phòng thi.
- **Tìm kiếm sinh viên theo họ tên:** `GET /api/students/search?fullName=...`
  - Tìm kiếm sinh viên theo họ tên (hỗ trợ regex tìm gần đúng, không phân biệt hoa/thường).
- **Tra cứu chi tiết sinh viên theo MSSV:** `GET /api/students/:studentId`
  - Lấy thông tin cá nhân hiện tại của sinh viên bằng Mã số sinh viên.
