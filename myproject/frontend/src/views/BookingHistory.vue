<template>
  <div class="booking-history">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">预约记录</span>
      </template>
    </el-page-header>

    <div class="content-container">
      <!-- 筛选条件 -->
      <el-card class="filter-card">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" @change="loadBookings" style="width: 160px" clearable>
              <el-option label="全部" value="" />
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadBookings">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 预约记录列表 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>预约记录</span>
            <el-button type="text" @click="loadBookings">刷新</el-button>
          </div>
        </template>
        
        <div v-if="bookings.length === 0" class="empty-bookings">
          <el-empty description="暂无预约记录" />
        </div>
        <div v-else>
          <el-table :data="bookings" style="width: 100%">
            <el-table-column prop="booking_date" label="预约日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.booking_date) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="start_time" label="开始时间" width="100" />
            <el-table-column prop="end_time" label="结束时间" width="100" />
            
            <el-table-column prop="room_name" label="自习室" width="120" />
            <el-table-column prop="seat_number" label="座位号" width="100" />
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="check_in_time" label="签到时间" width="180">
              <template #default="scope">
                {{ scope.row.check_in_time ? formatDateTime(scope.row.check_in_time) : '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.status === 'active' && canCheckIn(scope.row)"
                  type="success" 
                  size="small"
                  @click="handleCheckIn(scope.row)"
                  :loading="loading.checkIn === scope.row.id"
                >
                  签到
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'active' && canCancel(scope.row)"
                  type="danger" 
                  size="small"
                  @click="handleCancel(scope.row)"
                  :loading="loading.cancel === scope.row.id"
                >
                  取消
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'active' && scope.row.check_in_time"
                  type="primary" 
                  size="small"
                  @click="handleRate(scope.row)"
                >
                  评价
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              :current-page="currentPage"
              :page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 评价对话框 -->
    <RatingDialog
      v-model="ratingDialogVisible"
      title="服务评价"
      :booking-id="currentBooking?.id"
      rating-type="booking"
      @submitted="onRatingSubmitted"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import RatingDialog from '../components/RatingDialog.vue'

export default {
  name: 'BookingHistory',
  components: {
    RatingDialog
  },
  setup() {
    const router = useRouter()
    const ratingFormRef = ref()
    
    // 响应式数据
    const bookings = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const ratingDialogVisible = ref(false)
    const currentBooking = ref(null)
    
    const loading = reactive({
      checkIn: null,
      cancel: null
    })
    
    const filterForm = reactive({
      status: ''
    })
    
    // 方法
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const loadBookings = async () => {
      try {
        const token = localStorage.getItem('token')
        const params = {
          page: currentPage.value,
          pageSize: pageSize.value,
          ...filterForm
        }
        
        const response = await axios.get('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
          params
        })
        
        bookings.value = response.data.records
        total.value = response.data.total
      } catch (error) {
        ElMessage.error('获取预约记录失败')
      }
    }
    
    const resetFilter = () => {
      filterForm.status = ''
      currentPage.value = 1
      loadBookings()
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadBookings()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadBookings()
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
    }
    
    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    }
    
    const getStatusType = (status) => {
      const typeMap = {
        'active': 'success',
        'completed': 'info',
        'cancelled': 'danger'
      }
      return typeMap[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const textMap = {
        'active': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return textMap[status] || status
    }
    
    const canCheckIn = (booking) => {
      if (booking.check_in_time) return false
      
      const today = new Date().toISOString().split('T')[0]
      if (booking.booking_date !== today) return false
      
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)
      return currentTime >= booking.start_time && currentTime <= booking.end_time
    }
    
    const canCancel = (booking) => {
      try {
        // 正确处理时区转换
        let bookingDate
        if (booking.booking_date.includes('T')) {
          // 如果是ISO格式，先转换为本地时间，再提取日期
          const utcDate = new Date(booking.booking_date)
          if (isNaN(utcDate.getTime())) {
            console.error('无效的UTC日期:', booking.booking_date)
            return false
          }
          // 使用toLocaleDateString获取北京时间，然后转换为标准格式
          const localDateString = utcDate.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
          // 解析格式为 YYYY/M/D 或 YYYY/M/DD 的字符串
          const parts = localDateString.split('/')
          if (parts.length === 3) {
            const year = parts[0]
            const month = parts[1].padStart(2, '0')
            const day = parts[2].padStart(2, '0')
            bookingDate = `${year}-${month}-${day}`
          } else {
            console.error('无法解析本地日期字符串:', localDateString)
            return false
          }
        } else {
          // 如果已经是日期格式，直接使用
          bookingDate = booking.booking_date
        }
        
        // 创建预约开始时间（使用本地时间）
        const bookingStartDateTime = new Date(`${bookingDate}T${booking.start_time}:00`)
        if (isNaN(bookingStartDateTime.getTime())) {
          console.error('无效的预约开始时间:', `${bookingDate}T${booking.start_time}:00`)
          return false
        }
        
        const now = new Date()
        
        // 临时调试信息
        console.log('=== canCancel 调试信息 ===')
        console.log('预约ID:', booking.id)
        console.log('原始预约日期:', booking.booking_date)
        console.log('UTC时间对象:', new Date(booking.booking_date))
        console.log('处理后的日期:', bookingDate)
        console.log('预约开始时间:', booking.start_time)
        console.log('完整预约开始时间字符串:', `${bookingDate}T${booking.start_time}:00`)
        console.log('bookingStartDateTime:', bookingStartDateTime)
        console.log('bookingStartDateTime.toISOString():', bookingStartDateTime.toISOString())
        console.log('bookingStartDateTime.toLocaleString():', bookingStartDateTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
        console.log('now:', now)
        console.log('now.toISOString():', now.toISOString())
        console.log('now.toLocaleString():', now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
        console.log('bookingStartDateTime > now:', bookingStartDateTime > now)
        console.log('时间差(毫秒):', bookingStartDateTime.getTime() - now.getTime())
        console.log('时间差(小时):', (bookingStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))
        console.log('========================')
        
        return bookingStartDateTime > now
      } catch (error) {
        console.error('canCancel函数出错:', error)
        console.error('预约数据:', booking)
        return false
      }
    }
    
    const handleCheckIn = async (booking) => {
      try {
        await ElMessageBox.confirm(
          `确认签到 ${booking.room_name} 的 ${booking.seat_number} 座位吗？`,
          '确认签到',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        loading.checkIn = booking.id
        const token = localStorage.getItem('token')
        
        const response = await axios.put(`/api/bookings/${booking.id}/checkin`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        ElMessage.success(`签到成功！获得 ${response.data.points_change} 积分`)
        loadBookings()
        
      } catch (error) {
        if (error === 'cancel') {
          return
        }
        
        if (error.response) {
          ElMessage.error(error.response.data.error || '签到失败')
        } else {
          ElMessage.error('签到失败')
        }
      } finally {
        loading.checkIn = null
      }
    }
    
    const handleCancel = async (booking) => {
      try {
        await ElMessageBox.confirm(
          `确认取消预约 ${booking.room_name} 的 ${booking.seat_number} 座位吗？`,
          '确认取消',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        loading.cancel = booking.id
        const token = localStorage.getItem('token')
        
        const response = await axios.put(`/api/bookings/${booking.id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        ElMessage.success(`预约已取消，扣除 ${Math.abs(response.data.points_change)} 积分`)
        loadBookings()
        
      } catch (error) {
        if (error === 'cancel') {
          return
        }
        
        if (error.response) {
          ElMessage.error(error.response.data.error || '取消失败')
        } else {
          ElMessage.error('取消失败')
        }
      } finally {
        loading.cancel = null
      }
    }
    
    const handleRate = (booking) => {
      currentBooking.value = booking
      ratingDialogVisible.value = true
    }
    
    const onRatingSubmitted = async () => {
      try {
        ElMessage.success('评价提交成功')
        ratingDialogVisible.value = false
        loadBookings()
      } catch (error) {
        ElMessage.error('评价提交失败')
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadBookings()
    })
    
    return {
      ratingFormRef,
      bookings,
      currentPage,
      pageSize,
      total,
      loading,
      filterForm,
      ratingDialogVisible,
      currentBooking,
      goBack,
      loadBookings,
      resetFilter,
      handleSizeChange,
      handleCurrentChange,
      formatDate,
      formatDateTime,
      getStatusType,
      getStatusText,
      canCheckIn,
      canCancel,
      handleCheckIn,
      handleCancel,
      handleRate,
      onRatingSubmitted
    }
  }
}
</script>

<style scoped>
.booking-history {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
}

.content-container {
  margin-top: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-bookings {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 