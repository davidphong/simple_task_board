# Task Board Application

Ứng dụng quản lý công việc (Task Management) đầy đủ chức năng với frontend React và backend Flask.

## Tính năng

- Xác thực người dùng (đăng ký, đăng nhập, đăng xuất)
- Tạo và quản lý các bảng công việc (boards)
- Tạo, cập nhật và xóa các công việc (tasks)
- Phân loại công việc theo trạng thái (Đang thực hiện, Hoàn thành, Không thực hiện)
- Giao diện responsive
- Mã màu cho các trạng thái task khác nhau

## Công nghệ sử dụng

### Frontend
- React (framework UI)
- React Router (điều hướng)
- Styled Components (CSS-in-JS)
- Zustand (quản lý state)
- Axios (gọi API)
- Docker & Nginx (đóng gói và triển khai)

### Backend
- Flask (framework API)
- SQLite (cơ sở dữ liệu)
- JWT (xác thực token)
- Docker (đóng gói và triển khai)

## Cấu trúc dự án

```
simple_task_board/
├── client/                  # Frontend React app
│   ├── public/              # Static files
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   └── utils/           # Utility functions
│   ├── Dockerfile           # Frontend Docker config
│   └── nginx.conf           # Nginx config for routing
├── server/                  # Backend Flask app
│   ├── app.py               # Main application file
│   ├── schema.sql           # Database schema
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend Docker config
├── docker-compose.yml       # Docker Compose configuration
└── README.md                # Project documentation
```

## Cài đặt và chạy ứng dụng

### Yêu cầu

- Docker
- Docker Compose

### Cài đặt và chạy với Docker (Khuyến nghị)

1. Clone repository
```
git clone <repository-url>
cd simple_task_board
```

2. Build và khởi động các containers
```
docker-compose up --build
```

3. Truy cập ứng dụng
- Frontend: http://localhost:745
- Backend API: http://localhost:1337

### Các API Endpoints

#### Xác thực
- POST /api/user/signup - Đăng ký người dùng mới
- POST /api/user/login - Đăng nhập và nhận JWT token

#### Boards
- GET /api/boards - Lấy tất cả boards của người dùng
- POST /api/boards - Tạo board mới
- GET /api/boards/:id - Lấy thông tin chi tiết của một board
- PUT /api/boards/:id - Cập nhật board
- DELETE /api/boards/:id - Xóa board

#### Tasks
- POST /api/tasks - Tạo task mới
- PUT /api/tasks/:id - Cập nhật task
- DELETE /api/tasks/:id - Xóa task

## Chi tiết triển khai

### Frontend (React)

Frontend được xây dựng bằng React với các tính năng:
- **Zustand**: Quản lý state ứng dụng (thay thế Redux) nhẹ và đơn giản hơn
- **Styled Components**: Styling dựa trên component
- **React Router**: Điều hướng giữa các trang
- **Axios**: Gọi API tới backend

Build process:
1. Node.js build môi trường phát triển
2. Tạo production build sử dụng `npm run build`
3. Nginx phục vụ static files từ build và chuyển tiếp API requests đến backend

### Backend (Flask)

Backend là API RESTful sử dụng Flask và SQLite:
- **Flask**: Framework web nhẹ cho Python
- **SQLite**: Cơ sở dữ liệu tệp đơn giản, nhẹ nhàng
- **JWT**: JSON Web Tokens để xác thực người dùng
- **Flask-CORS**: Hỗ trợ Cross-Origin Resource Sharing

Database schema:
- **Users**: Lưu thông tin người dùng và xác thực
- **Boards**: Các bảng công việc của người dùng
- **Tasks**: Các công việc thuộc về mỗi bảng

### Docker và Containerization

Ứng dụng được đóng gói hoàn toàn trong Docker:
- **Frontend**: Multi-stage build với Node.js (build) và Nginx (serving)
- **Backend**: Python container với Flask
- **Docker Compose**: Kết hợp các containers và định nghĩa volumes, networks

Cấu hình ports:
- Frontend: Port 745
- Backend: Port 1337

## Phát triển

### Phát triển Frontend

```
cd client
npm install
npm start
```

### Phát triển Backend

```
cd server
pip install -r requirements.txt
python app.py
```

## Mở rộng trong tương lai

Một số hướng phát triển có thể xem xét:
- Thêm database quan hệ như PostgreSQL
- Phân quyền người dùng chi tiết hơn
- Thêm tính năng chia sẻ boards giữa nhiều người dùng
- Thêm tính năng kéo-thả (drag-and-drop) cho tasks
- Thêm thống kê và biểu đồ 