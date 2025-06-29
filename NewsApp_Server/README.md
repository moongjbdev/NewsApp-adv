# NewsApp Backend API v2.0

Backend API cho ứng dụng đọc tin tức với tích hợp NewsData.io, hệ thống bình luận và quản lý người dùng.

## 🚀 Features

- **User Authentication & Management**
  - Đăng ký/Đăng nhập với JWT
  - Quản lý profile người dùng
  - Role-based access control

- **Reading History & Bookmarks**
  - Lưu lịch sử đọc tin tức
  - Bookmark tin tức yêu thích
  - Đồng bộ giữa các thiết bị

- **Comments System**
  - Thêm/sửa/xóa bình luận
  - Like/Dislike bình luận
  - Reply bình luận (nested comments)
  - Pagination và sorting

- **News Integration**
  - Cache tin tức từ NewsData.io
  - Analytics và tracking
  - Popular articles

- **Security & Performance**
  - Rate limiting
  - Input validation
  - Error handling
  - JWT authentication

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- npm hoặc yarn

## 🛠️ Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd NewsApp_Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment:**
   ```bash
   # Copy env.example to .env
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Environment variables:**
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/newsapp
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # NewsData.io API (Optional)
   NEWSDATA_API_KEY=your_newsdata_api_key_here
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:8081
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB:**
   ```bash
   # Start MongoDB service
   mongod
   ```

6. **Reset database indexes (if needed):**
   ```bash
   npm run reset-indexes
   ```

7. **Start server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile

### User Management
- `GET /api/user/preferences` - Lấy preferences
- `PUT /api/user/preferences` - Cập nhật preferences
- `GET /api/user/reading-history` - Lấy lịch sử đọc
- `POST /api/user/reading-history` - Thêm vào lịch sử
- `GET /api/user/stats` - Lấy thống kê user

### Bookmarks
- `GET /api/user/bookmarks` - Lấy bookmarks
- `POST /api/user/bookmarks` - Thêm bookmark
- `DELETE /api/user/bookmarks/:id` - Xóa bookmark
- `GET /api/user/bookmarks/check/:id` - Kiểm tra bookmark

### Comments
- `GET /api/comments/:article_id` - Lấy bình luận
- `GET /api/comments/:comment_id/replies` - Lấy replies
- `POST /api/comments` - Thêm bình luận
- `PUT /api/comments/:id` - Sửa bình luận
- `DELETE /api/comments/:id` - Xóa bình luận
- `POST /api/comments/:id/like` - Like bình luận
- `POST /api/comments/:id/dislike` - Dislike bình luận

### News
- `GET /api/news/cached/:category` - Lấy tin tức cached
- `GET /api/news/breaking` - Tin tức nổi bật
- `GET /api/news/popular` - Tin tức phổ biến
- `POST /api/news/track-view` - Track lượt xem
- `POST /api/news/track-category` - Track category view

## 🔒 Security Features

- **Rate Limiting**: Giới hạn số request từ mỗi IP
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **JWT Authentication**: Xác thực token
- **CORS Protection**: Bảo vệ cross-origin requests
- **Error Handling**: Xử lý lỗi an toàn

## 📊 Database Models

- **User**: Thông tin người dùng và preferences
- **Bookmark**: Bookmarks của user
- **ReadingHistory**: Lịch sử đọc tin tức
- **Comment**: Bình luận và replies
- **Analytics**: Thống kê và tracking

## 🚀 Deployment

1. **Production environment:**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Using PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name newsapp-backend
   pm2 save
   pm2 startup
   ```

3. **Using Docker:**
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server với nodemon
- `npm run reset-indexes` - Reset database indexes
- `npm test` - Run tests

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC License

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ maintainer. 