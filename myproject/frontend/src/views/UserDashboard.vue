<template>
  <div class="dashboard-container">
    <el-container>
      <el-header class="dashboard-header">
        <div class="header-left">
          <h2>图书馆座位预约系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar">
                {{ userInfo.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="dashboard-main">
        <el-row :gutter="20">
          <!-- 用户信息卡片 -->
          <el-col :span="8">
            <el-card class="user-card">
              <template #header>
                <div class="card-header">
                  <span>用户信息</span>
                  <el-button link @click="goToProfile">编辑</el-button>
                </div>
              </template>
              <div class="user-info-content">
                <div class="avatar-section">
                  <el-avatar :size="80" :src="userInfo.avatar">
                    {{ userInfo.username?.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <h3>{{ userInfo.real_name || userInfo.username }}</h3>
                  <p class="user-role">{{ userInfo.student_id ? '学生' : '用户' }}</p>
                </div>
                <el-divider />
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">用户名：</span>
                    <span class="value">{{ userInfo.username }}</span>
                  </div>
                  <div class="info-item" v-if="userInfo.email">
                    <span class="label">邮箱：</span>
                    <span class="value">{{ userInfo.email }}</span>
                  </div>
                  <div class="info-item" v-if="userInfo.student_id">
                    <span class="label">学号：</span>
                    <span class="value">{{ userInfo.student_id }}</span>
                  </div>
                  <div class="info-item" v-if="userInfo.phone">
                    <span class="label">手机：</span>
                    <span class="value">{{ userInfo.phone }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 积分状态卡片 -->
          <el-col :span="8">
            <el-card class="points-card">
              <template #header>
                <div class="card-header">
                  <span>积分状态</span>
                  <el-button link @click="refreshPoints">刷新</el-button>
                </div>
              </template>
              <div class="points-content">
                <div class="points-display">
                  <div class="points-number">{{ userInfo.points || 0 }}</div>
                  <div class="points-label">当前积分</div>
                </div>
                <el-divider />
                <div class="points-info">
                  <div class="points-item">
                    <el-icon><Trophy /></el-icon>
                    <span>积分等级：{{ getPointsLevel() }}</span>
                  </div>
                  <div class="points-item">
                    <el-icon><Gift /></el-icon>
                    <span>可用优惠：{{ getAvailableDiscounts() }}</span>
                  </div>
                </div>
                <div class="points-buttons">
                  <el-button type="primary" size="large" class="points-button" @click="goToPoints">
                    <el-icon><Star /></el-icon>
                    <span>积分管理</span>
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 快速操作卡片 -->
          <el-col :span="8">
            <el-card class="actions-card">
              <template #header>
                <div class="card-header">
                  <span>快速操作</span>
                </div>
              </template>
              <div class="actions-content">
                <el-button type="primary" size="large" class="action-button" @click="goToBooking">
                  <el-icon><Calendar /></el-icon>
                  <span>预约座位</span>
                </el-button>
                <el-button type="success" size="large" class="action-button" @click="goToBookings">
                  <el-icon><Document /></el-icon>
                  <span>我的预约</span>
                </el-button>
                <el-button type="warning" size="large" class="action-button" @click="goToPoints">
                  <el-icon><Star /></el-icon>
                  <span>积分管理</span>
                </el-button>
                <el-button type="info" size="large" class="action-button" @click="goToRatings">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>评价管理</span>
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 功能导航区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card class="navigation-card">
              <template #header>
                <div class="card-header">
                  <span>功能导航</span>
                </div>
              </template>
              <div class="navigation-grid">
                <div class="nav-item" @click="goToBooking">
                  <div class="nav-icon primary">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="nav-text">
                    <h3>座位预约</h3>
                    <p>选择座位和时间进行预约</p>
                  </div>
                </div>
                
                <div class="nav-item" @click="goToBookings">
                  <div class="nav-icon success">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="nav-text">
                    <h3>预约记录</h3>
                    <p>查看和管理我的预约</p>
                  </div>
                </div>
                
                <div class="nav-item" @click="goToPoints">
                  <div class="nav-icon warning">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="nav-text">
                    <h3>积分管理</h3>
                    <p>查看积分历史和等级权益</p>
                  </div>
                </div>
                
                <div class="nav-item" @click="goToRatings">
                  <div class="nav-icon info">
                    <el-icon><ChatDotRound /></el-icon>
                  </div>
                  <div class="nav-text">
                    <h3>评价管理</h3>
                    <p>查看和提交使用评价</p>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 评价记录 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>评价记录</span>
                  <el-button link @click="loadRatings">刷新</el-button>
                </div>
              </template>
              <div v-if="ratings.length === 0" class="empty-ratings">
                <el-empty description="暂无评价记录" />
              </div>
              <div v-else class="ratings-list">
                <div v-for="rating in ratings" :key="rating.id" class="rating-item">
                  <div class="rating-header">
                    <span class="rating-date">{{ formatDate(rating.created_at) }}</span>
                    <span class="rating-username">{{ rating.username }}</span>
                    <el-rate v-model="rating.rating" disabled />
                  </div>
                  <div class="rating-comment" v-if="rating.comment">
                    {{ rating.comment }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 退出登录按钮 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <div class="logout-section">
              <el-button 
                type="danger" 
                size="large" 
                @click="handleLogout"
                class="logout-button"
              >
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Trophy, Gift, Calendar, Document, Star, ChatDotRound, SwitchButton } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'UserDashboard',
  components: {
    ArrowDown,
    Trophy,
    Gift,
    Calendar,
    Document,
    Star,
    ChatDotRound,
    SwitchButton
  },
  setup() {
    const router = useRouter()
    const userInfo = reactive({})
    const ratings = ref([])
    
    // 获取用户信息
    const loadUserInfo = async () => {
      try {
        const response = await axios.get('/api/user/profile')
        Object.assign(userInfo, response.data.user)
      } catch (error) {
        ElMessage.error('获取用户信息失败')
      }
    }
    
    // 获取评价记录
    const loadRatings = async () => {
      try {
        const response = await axios.get('/api/user/ratings')
        ratings.value = response.data.ratings
      } catch (error) {
        ElMessage.error('获取评价记录失败')
      }
    }
    
    // 刷新积分
    const refreshPoints = async () => {
      try {
        const response = await axios.get('/api/user/points')
        userInfo.points = response.data.points
        ElMessage.success('积分已刷新')
      } catch (error) {
        ElMessage.error('刷新积分失败')
      }
    }
    
    // 获取积分等级
    const getPointsLevel = () => {
      const points = userInfo.points || 0
      if (points >= 1000) return '钻石会员'
      if (points >= 500) return '金牌会员'
      if (points >= 200) return '银牌会员'
      return '普通会员'
    }
    
    // 获取可用优惠
    const getAvailableDiscounts = () => {
      const points = userInfo.points || 0
      if (points >= 1000) return '免费预约券 x3'
      if (points >= 500) return '免费预约券 x2'
      if (points >= 200) return '免费预约券 x1'
      return '无'
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN')
    }
    
    // 用户下拉菜单处理
    const handleCommand = (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'logout':
          handleLogout()
          break
      }
    }
    
    // 退出登录
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '退出确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 调用退出登录API
        const token = localStorage.getItem('token')
        await axios.post('/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        ElMessage.success('退出登录成功')
        router.push('/login')
        
      } catch (error) {
        if (error === 'cancel') {
          return
        }
        
        // 即使API调用失败，也清除本地存储并跳转
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    
    // 页面跳转
    const goToProfile = () => router.push('/profile')
    const goToBooking = () => {
      router.push('/booking')
    }
    const goToBookings = () => {
      router.push('/bookings')
    }
    const goToPoints = () => {
      router.push('/points')
    }
    const goToRatings = () => {
      router.push('/ratings')
    }
    
    // 积分相关方法
    const showPointsHistory = () => {
      router.push('/points')
    }
    
    const goToPointsManagement = () => {
      router.push('/points')
    }
    
    onMounted(() => {
      loadUserInfo()
      loadRatings()
    })
    
    return {
      userInfo,
      ratings,
      loadUserInfo,
      loadRatings,
      refreshPoints,
      getPointsLevel,
      getAvailableDiscounts,
      formatDate,
      handleCommand,
      handleLogout,
      goToProfile,
      goToBooking,
      goToBookings,
      goToPoints,
      goToRatings,
      showPointsHistory,
      goToPointsManagement
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.dashboard-main {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-card, .points-card, .actions-card {
  height: 100%;
}

.user-info-content {
  text-align: center;
}

.avatar-section {
  margin-bottom: 20px;
}

.avatar-section h3 {
  margin: 10px 0 5px 0;
  color: #303133;
}

.user-role {
  color: #909399;
  margin: 0;
}

.info-list {
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.info-item .label {
  color: #909399;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
}

.points-card {
  height: 100% !important;
  min-height: 400px !important;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  overflow: hidden;
}

.points-card .el-card__header {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  border-bottom: none;
  padding: 16px 20px;
}

.points-card .card-header {
  font-weight: 600;
  font-size: 16px;
}

.points-content {
  text-align: center;
  padding: 20px;
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.points-display {
  margin-bottom: 15px;
}

.points-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.points-label {
  color: #909399;
  font-size: 14px;
}

.points-info {
  margin-bottom: 15px;
}

.points-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.points-item .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.points-buttons {
  margin-top: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  width: 100% !important;
}

.points-button {
  width: 100% !important;
  height: 45px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border: none !important;
  position: relative !important;
  overflow: hidden !important;
  flex: 1 !important;
  min-height: 45px !important;
  max-height: 45px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  box-sizing: border-box !important;
  padding: 0 16px !important;
}

.points-button .el-icon {
  margin-right: 8px !important;
  flex-shrink: 0 !important;
  font-size: 16px !important;
}

.points-button span {
  flex: 1 !important;
  text-align: center !important;
  font-size: 14px !important;
  line-height: 1 !important;
}

.points-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.points-button:hover::before {
  left: 100%;
}

.points-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.points-button.el-button--primary {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.points-button.el-button--success {
  background: linear-gradient(135deg, #67c23a, #e6a23c);
}

.actions-card {
  height: 100% !important;
  min-height: 400px !important;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  overflow: hidden;
}

.actions-card .el-card__header {
  background: linear-gradient(135deg, #409eff, #67c23a);
  color: white;
  border-bottom: none;
  padding: 16px 20px;
}

.actions-card .card-header {
  font-weight: 600;
  font-size: 16px;
}

.actions-content {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  padding: 20px !important;
  height: calc(100% - 60px) !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

.action-button {
  width: 100% !important;
  height: 45px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border: none !important;
  position: relative !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  box-sizing: border-box !important;
  padding: 0 16px !important;
}

.action-button .el-icon {
  margin-right: 8px !important;
  flex-shrink: 0 !important;
  font-size: 16px !important;
}

.action-button span {
  flex: 1 !important;
  text-align: center !important;
  font-size: 14px !important;
  line-height: 1 !important;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-button:hover::before {
  left: 100%;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.el-button--primary {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.action-button.el-button--success {
  background: linear-gradient(135deg, #67c23a, #e6a23c);
}

.action-button.el-button--warning {
  background: linear-gradient(135deg, #e6a23c, #f56c6c);
}

.action-button.el-button--info {
  background: linear-gradient(135deg, #909399, #409eff);
}

.actions-content .action-button {
  flex: 1 !important;
  min-height: 45px !important;
  max-height: 45px !important;
  flex-grow: 1 !important;
  flex-shrink: 0 !important;
}

.points-buttons .points-button {
  flex: 1 !important;
  min-height: 45px !important;
  max-height: 45px !important;
  flex-grow: 1 !important;
  flex-shrink: 0 !important;
}

.ratings-list {
  max-height: 300px;
  overflow-y: auto;
}

.rating-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.rating-item:last-child {
  border-bottom: none;
}

.rating-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.rating-date {
  color: #909399;
  font-size: 12px;
}

.rating-username {
  color: #909399;
  font-size: 12px;
  text-align: left;
  margin-left: 8px;
  min-width: 60px;
  display: inline-block;
}

.rating-comment {
  color: #606266;
  line-height: 1.5;
}

.empty-ratings {
  padding: 40px 0;
}

.logout-section {
  text-align: center;
  padding: 20px 0;
}

.logout-button {
  width: 200px;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
  border: none;
  transition: all 0.3s ease;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.3);
}

.navigation-card {
  padding: 20px;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.nav-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
}

.nav-icon.primary {
  background: linear-gradient(135deg, #409eff, #67c23a);
}

.nav-icon.success {
  background: linear-gradient(135deg, #67c23a, #e6a23c);
}

.nav-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #f56c6c);
}

.nav-icon.info {
  background: linear-gradient(135deg, #909399, #409eff);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  flex: 1;
}

.nav-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.nav-text p {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navigation-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .nav-item {
    padding: 20px 16px;
  }
  
  .nav-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .nav-text h3 {
    font-size: 16px;
  }
  
  .nav-text p {
    font-size: 13px;
  }
  
  .logout-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .nav-item {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .nav-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
}

/* 强制覆盖Element Plus默认样式 */
.points-button.el-button,
.action-button.el-button {
  width: 100% !important;
  height: 45px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border: none !important;
  position: relative !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  box-sizing: border-box !important;
  padding: 0 16px !important;
  margin: 0 !important;
  line-height: 1 !important;
}

.points-button.el-button .el-icon,
.action-button.el-button .el-icon {
  margin-right: 8px !important;
  flex-shrink: 0 !important;
  font-size: 16px !important;
  margin-left: 0 !important;
}

.points-button.el-button span,
.action-button.el-button span {
  flex: 1 !important;
  text-align: center !important;
  font-size: 14px !important;
  line-height: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 调试样式 - 可以临时启用来查看布局 */
/*
.points-button,
.action-button {
  border: 2px solid red !important;
}

.points-button .el-icon,
.action-button .el-icon {
  border: 1px solid blue !important;
}

.points-button span,
.action-button span {
  border: 1px solid green !important;
}
*/
</style> 