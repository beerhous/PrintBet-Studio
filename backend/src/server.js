const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

// 路由导入
const ocrRoutes = require('./routes/ocr');
const betRoutes = require('./routes/bet');
const printRoutes = require('./routes/print');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 确保上传目录存在
fs.ensureDirSync(path.join(__dirname, '../uploads'));

// API路由
app.use('/api/ocr', ocrRoutes);
app.use('/api/bet', betRoutes);
app.use('/api/print', printRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`PrintBet Studio Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;