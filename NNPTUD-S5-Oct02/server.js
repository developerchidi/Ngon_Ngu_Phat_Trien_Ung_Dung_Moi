const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/auth', authRoutes);

// Serve test page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API đang hoạt động bình thường',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🌐 Giao diện test: http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET    /api/health - Health check`);
  console.log(`   GET    /api/roles - Lấy tất cả roles`);
  console.log(`   GET    /api/roles/:id - Lấy role theo ID`);
  console.log(`   POST   /api/roles - Tạo role mới`);
  console.log(`   PUT    /api/roles/:id - Cập nhật role`);
  console.log(`   DELETE /api/roles/:id - Xóa mềm role`);
  console.log(`   GET    /api/users - Lấy tất cả users (có tìm kiếm)`);
  console.log(`   GET    /api/users/:id - Lấy user theo ID`);
  console.log(`   GET    /api/users/username/:username - Lấy user theo username`);
  console.log(`   POST   /api/users - Tạo user mới`);
  console.log(`   PUT    /api/users/:id - Cập nhật user`);
  console.log(`   DELETE /api/users/:id - Xóa mềm user`);
  console.log(`   POST   /api/auth/login - Authentication`);
});

module.exports = app;
