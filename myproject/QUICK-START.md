# 图书馆座位预约系统 - 快速开始指南

## 🚀 立即开始

### 1. 启动独立模式（推荐用于开发测试）

```bash
# 后端
cd backend
npm install
npm start

# 前端（新终端）
cd frontend
npm install
npm run serve
```

访问 `http://localhost:8080` 即可使用系统！

### 2. 测试API连接

```bash
cd backend
npm run test-api
```

## 📋 系统功能

### ✅ 已实现功能
- ✅ 用户注册/登录
- ✅ 用户信息管理
- ✅ 积分系统
- ✅ 座位预约
- ✅ 预约记录管理
- ✅ 评价系统
- ✅ 退出登录

### 🔧 技术栈
- **后端**: Express + SQLite + JWT
- **前端**: Vue.js 3 + Element Plus
- **数据库**: SQLite（本地）/ 学校API（生产）

## 🔗 连接学校图书馆API

### 步骤1: 获取API信息
联系学校图书馆IT部门，获取：
- API基础URL
- API密钥
- API文档

### 步骤2: 配置环境变量
```bash
# 复制配置文件
cp backend/env.example backend/.env

# 编辑配置文件
USE_LIBRARY_API=true
LIBRARY_API_BASE_URL=https://library.your-university.edu/api
LIBRARY_API_KEY=your-api-key
LIBRARY_API_SECRET=your-api-secret
```

### 步骤3: 测试连接
```bash
cd backend
npm run test-api
```

### 步骤4: 启动集成模式
```bash
# 后端
npm start

# 前端
cd ../frontend
npm run serve
```

## 📁 项目结构

```
myproject/
├── backend/                 # 后端服务
│   ├── app.js              # 主应用文件
│   ├── config/             # 配置文件
│   ├── services/           # API服务
│   ├── routes/             # 路由文件
│   ├── middleware/         # 中间件
│   └── database.sqlite     # 本地数据库
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   └── router/         # 路由配置
│   └── public/
└── README.md
```

## 🔧 开发指南

### 添加新功能
1. 在后端 `app.js` 或 `routes/` 中添加API
2. 在前端 `views/` 中创建页面
3. 在 `router/index.js` 中添加路由

### 数据库操作
```javascript
// 查询数据
db.all('SELECT * FROM users', (err, rows) => {
  // 处理结果
});

// 插入数据
db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
  [username, password], function(err) {
  // 处理结果
});
```

### API开发
```javascript
// 创建API端点
app.get('/api/users', authenticateToken, (req, res) => {
  // 处理请求
  res.json({ success: true, data: users });
});
```

## 🐛 常见问题

### Q: 启动时数据库错误
A: 删除 `backend/database.sqlite` 文件，重新启动服务

### Q: 前端无法连接后端
A: 检查后端是否在 `http://localhost:3000` 运行

### Q: API连接失败
A: 检查环境变量配置和网络连接

### Q: 登录失败
A: 使用默认账号：`admin` / `123456`

## 📞 技术支持

### 日志查看
```bash
# 后端日志
cd backend
npm start

# 前端日志
cd frontend
npm run serve
```

### 调试模式
```bash
# 启用详细日志
LOG_LEVEL=debug npm start
```

## 🚀 部署建议

### 开发环境
- 使用独立模式（本地数据库）
- 启用热重载
- 详细日志输出

### 测试环境
- 使用集成模式（测试API）
- 模拟真实数据
- 性能测试

### 生产环境
- 使用集成模式（正式API）
- 启用HTTPS
- 监控和告警

## 📚 相关文档

- [API集成指南](./backend/README-API-Integration.md)
- [前端开发指南](./frontend/README.md)
- [数据库设计文档](./docs/database.md)

---

**🎉 恭喜！你现在可以开始使用图书馆座位预约系统了！** 