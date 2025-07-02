# 图书馆座位预约系统

一个基于 Vue.js + Element Plus + Express + SQLite 的图书馆座位预约系统。

## 功能特性

### 用户登录与基础信息
- ✅ 用户注册和登录
- ✅ JWT 身份验证
- ✅ 用户信息管理
- ✅ 积分系统
- ✅ 评价记录
- ✅ 个人中心
- ✅ 第三方登录（校园账号）预留接口

## 技术栈

### 前端
- Vue.js 3
- Element Plus UI 组件库
- Vue Router 路由管理
- Axios HTTP 客户端

### 后端
- Node.js
- Express.js 框架
- SQLite 数据库
- JWT 身份验证
- bcryptjs 密码加密

## 项目结构

```
myproject/
├── backend/                 # 后端代码
│   ├── app.js              # Express 服务器主文件
│   └── package.json        # 后端依赖配置
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   │   ├── Login.vue   # 登录页面
│   │   │   ├── Register.vue # 注册页面
│   │   │   ├── Dashboard.vue # 仪表板
│   │   │   └── Profile.vue # 个人中心
│   │   ├── router/         # 路由配置
│   │   │   └── index.js
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   └── package.json        # 前端依赖配置
└── README.md               # 项目说明
```

## 安装和运行

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 启动后端服务器

```bash
cd backend
npm start
# 或者使用开发模式
npm run dev
```

后端服务器将在 http://localhost:3000 启动

### 4. 启动前端开发服务器

```bash
cd frontend
npm run serve
```

前端应用将在 http://localhost:8080 启动

## API 接口

### 用户认证
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 用户信息
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/points` - 获取用户积分
- `GET /api/user/ratings` - 获取用户评价记录

## 数据库结构

### users 表
- id: 用户ID（主键）
- username: 用户名（唯一）
- password: 加密密码
- email: 邮箱
- real_name: 真实姓名
- student_id: 学号
- phone: 手机号码
- points: 积分
- avatar: 头像
- created_at: 创建时间
- updated_at: 更新时间

### user_ratings 表
- id: 评价ID（主键）
- user_id: 用户ID（外键）
- rating: 评分（1-5）
- comment: 评价内容
- created_at: 创建时间

## 开发说明

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发模式
- 后端：使用 nodemon 自动重启
- 前端：使用 Vue CLI 热重载

### 部署
- 前端：`npm run build` 构建生产版本
- 后端：直接运行 `node app.js`

## 下一步开发计划

1. 座位管理功能
2. 预约系统
3. 座位地图
4. 预约历史
5. 管理员后台
6. 消息通知系统

## 许可证

MIT License 