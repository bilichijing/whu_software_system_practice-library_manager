# 图书馆座位预约系统 - API集成指南

## 概述

本系统支持两种运行模式：
1. **独立模式**：使用本地SQLite数据库，适合开发和测试
2. **集成模式**：连接到学校图书馆的真实API，适合生产环境

## 配置步骤

### 1. 环境变量配置

复制 `env.example` 文件为 `.env`，并配置以下变量：

```bash
# 服务器配置
PORT=3000
JWT_SECRET=your-secret-key-here

# 学校图书馆API配置
USE_LIBRARY_API=false  # 设置为 true 启用学校API
LIBRARY_API_BASE_URL=https://library.your-university.edu/api
LIBRARY_API_KEY=your-api-key-here
LIBRARY_API_SECRET=your-api-secret-here
```

### 2. 获取学校图书馆API信息

联系学校图书馆IT部门，获取以下信息：
- API基础URL
- API密钥（API Key）
- API密钥（API Secret）
- API文档和端点说明

### 3. 配置API端点

在 `config/api-config.js` 中配置学校图书馆的API端点：

```javascript
endpoints: {
  // 根据学校API文档调整这些端点
  userProfile: '/user/profile',
  userLogin: '/auth/login',
  seats: '/seats',
  bookings: '/bookings',
  // ... 其他端点
}
```

### 4. 数据映射配置

在 `config/api-config.js` 中配置数据字段映射：

```javascript
dataMapping: {
  user: {
    'student_id': 'studentId',  // 学校API字段 -> 系统字段
    'real_name': 'realName',
    // ...
  },
  seat: {
    'seat_id': 'id',
    'seat_number': 'seatNumber',
    // ...
  }
}
```

## 运行模式

### 独立模式（开发/测试）

```bash
# 设置环境变量
USE_LIBRARY_API=false

# 启动服务器
npm start
```

特点：
- 使用本地SQLite数据库
- 包含模拟数据
- 适合开发和测试
- 无需外部API依赖

### 集成模式（生产）

```bash
# 设置环境变量
USE_LIBRARY_API=true
LIBRARY_API_BASE_URL=https://library.your-university.edu/api
LIBRARY_API_KEY=your-actual-api-key
LIBRARY_API_SECRET=your-actual-api-secret

# 启动服务器
npm start
```

特点：
- 连接到学校图书馆真实API
- 实时数据同步
- 适合生产环境
- 需要稳定的网络连接

## API端点说明

### 用户相关
- `GET /api/library/user/profile` - 获取用户信息
- `POST /api/library/auth/login` - 用户登录
- `POST /api/library/auth/logout` - 用户退出

### 座位相关
- `GET /api/library/seats` - 获取座位列表
- `GET /api/library/seats/:seatId/availability` - 查询座位可用性
- `GET /api/library/seats/map/:roomId` - 获取座位地图

### 预约相关
- `POST /api/library/bookings` - 创建预约
- `GET /api/library/bookings/history` - 获取预约历史
- `POST /api/library/bookings/:bookingId/cancel` - 取消预约

### 房间相关
- `GET /api/library/rooms` - 获取房间列表
- `GET /api/library/rooms/:roomId/status` - 获取房间状态

## 错误处理

系统包含完善的错误处理机制：

1. **网络错误**：自动重试和降级处理
2. **认证错误**：自动刷新token
3. **数据格式错误**：数据映射和验证
4. **API限流**：请求频率控制

## 监控和日志

### 日志配置
```javascript
// 在 .env 中配置
LOG_LEVEL=info  // debug, info, warn, error
```

### 监控指标
- API响应时间
- 错误率统计
- 请求频率监控
- 数据同步状态

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查网络连接
   - 验证API URL是否正确
   - 确认API密钥是否有效

2. **数据格式不匹配**
   - 检查数据映射配置
   - 查看API文档确认字段名
   - 调整数据转换逻辑

3. **认证失败**
   - 验证API密钥
   - 检查token格式
   - 确认权限设置

### 调试模式

启用调试模式获取详细信息：

```bash
# 设置环境变量
LOG_LEVEL=debug
USE_LIBRARY_API=true

# 启动服务器
npm start
```

## 安全考虑

1. **API密钥安全**
   - 不要在代码中硬编码API密钥
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **数据传输安全**
   - 使用HTTPS协议
   - 验证API证书
   - 加密敏感数据

3. **访问控制**
   - 实施适当的权限控制
   - 记录API访问日志
   - 监控异常访问

## 性能优化

1. **缓存策略**
   - 缓存静态数据（房间、座位信息）
   - 实现请求去重
   - 使用CDN加速

2. **连接池**
   - 复用HTTP连接
   - 设置合理的超时时间
   - 实施连接重试机制

3. **数据同步**
   - 增量数据同步
   - 后台同步任务
   - 数据一致性检查

## 部署建议

1. **环境分离**
   - 开发环境：独立模式
   - 测试环境：集成模式（测试API）
   - 生产环境：集成模式（正式API）

2. **监控告警**
   - API可用性监控
   - 错误率告警
   - 性能指标监控

3. **备份策略**
   - 定期备份配置
   - 数据同步状态备份
   - 灾难恢复计划 