<template>
  <div class="seat-booking">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">座位预约</span>
      </template>
    </el-page-header>

    <div class="content-container">
      <!-- 预约表单 -->
      <el-card class="booking-form">
        <template #header>
          <div class="card-header">
            <span>预约信息</span>
          </div>
        </template>
        
        <el-form 
          ref="bookingFormRef" 
          :model="bookingForm" 
          :rules="bookingRules" 
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="预约日期" prop="booking_date">
                <el-date-picker
                  v-model="bookingForm.booking_date"
                  type="date"
                  placeholder="选择预约日期"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                  @change="onDateChange"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="自习室" prop="room_id">
                <el-select 
                  v-model="bookingForm.room_id" 
                  placeholder="选择自习室"
                  style="width: 100%"
                  @change="onRoomChange"
                >
                  <el-option
                    v-for="room in studyRooms"
                    :key="room.id"
                    :label="`${room.name} (${room.floor}楼-${room.area})`"
                    :value="room.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="start_time">
                <el-time-picker
                  v-model="bookingForm.start_time"
                  placeholder="选择开始时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 100%"
                  @change="onTimeChange"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="结束时间" prop="end_time">
                <el-time-picker
                  v-model="bookingForm.end_time"
                  placeholder="选择结束时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 100%"
                  @change="onTimeChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="searchSeats"
              :loading="loading.search"
              :disabled="!canSearch"
            >
              查询可用座位
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 座位选择区域 -->
      <el-card v-if="seats.length > 0" class="seat-selection">
        <template #header>
          <div class="card-header">
            <span>选择座位</span>
          </div>
        </template>
        
        <div class="seats-grid">
          <div 
            v-for="seat in seats" 
            :key="seat.id"
            class="seat-item"
            :class="{
              'available': seat.availability_status === 'available',
              'booked': seat.availability_status === 'booked',
              'selected': selectedSeat?.id === seat.id
            }"
            @click="selectSeat(seat)"
          >
            <div class="seat-number">{{ seat.seat_number }}</div>
            <div class="seat-status">{{ getSeatStatusText(seat.availability_status) }}</div>
          </div>
        </div>
        
        <div class="seat-actions" v-if="selectedSeat">
          <el-alert
            title="已选择座位"
            :description="`${selectedSeat.room_name} - ${selectedSeat.seat_number}`"
            type="success"
            show-icon
            :closable="false"
          />
          <el-button 
            type="primary" 
            @click="confirmBooking"
            :loading="loading.booking"
            style="margin-top: 15px;"
          >
            确认预约
          </el-button>
        </div>
      </el-card>

      <!-- 无可用座位提示 -->
      <el-card v-else-if="hasSearched && seats.length === 0" class="no-seats">
        <el-empty description="该时间段暂无可用座位">
          <el-button type="primary" @click="searchSeats">重新查询</el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

export default {
  name: 'SeatBooking',
  setup() {
    const router = useRouter()
    const bookingFormRef = ref()
    
    // 响应式数据
    const studyRooms = ref([])
    const seats = ref([])
    const selectedSeat = ref(null)
    const hasSearched = ref(false)
    
    const loading = reactive({
      search: false,
      booking: false
    })
    
    const bookingForm = reactive({
      booking_date: '',
      room_id: '',
      start_time: '',
      end_time: ''
    })
    
    const bookingRules = {
      booking_date: [
        { required: true, message: '请选择预约日期', trigger: 'change' }
      ],
      room_id: [
        { required: true, message: '请选择自习室', trigger: 'change' }
      ],
      start_time: [
        { required: true, message: '请选择开始时间', trigger: 'change' }
      ],
      end_time: [
        { required: true, message: '请选择结束时间', trigger: 'change' }
      ]
    }
    
    // 计算属性
    const canSearch = computed(() => {
      return bookingForm.booking_date && 
             bookingForm.room_id && 
             bookingForm.start_time && 
             bookingForm.end_time
    })
    
    // 方法
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const disabledDate = (time) => {
      return time.getTime() < Date.now() - 8.64e7
    }
    
    const onDateChange = () => {
      selectedSeat.value = null
      seats.value = []
      hasSearched.value = false
    }
    
    const onRoomChange = () => {
      selectedSeat.value = null
      seats.value = []
      hasSearched.value = false
    }
    
    const onTimeChange = () => {
      selectedSeat.value = null
      seats.value = []
      hasSearched.value = false
    }
    
    const loadStudyRooms = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/study-rooms', {
          headers: { Authorization: `Bearer ${token}` }
        })
        studyRooms.value = response.data
      } catch (error) {
        ElMessage.error('获取自习室列表失败')
      }
    }
    
    const searchSeats = async () => {
      try {
        await bookingFormRef.value.validate()
        
        loading.search = true
        const token = localStorage.getItem('token')
        
        const params = {
          room_id: bookingForm.room_id,
          date: bookingForm.booking_date,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time
        }
        
        const response = await axios.get('/api/seats', {
          headers: { Authorization: `Bearer ${token}` },
          params
        })
        
        seats.value = response.data
        selectedSeat.value = null
        hasSearched.value = true
        
        if (seats.value.length === 0) {
          ElMessage.warning('该时间段暂无可用座位')
        }
        
      } catch (error) {
        if (error.response) {
          ElMessage.error(error.response.data.error || '查询座位失败')
        } else {
          ElMessage.error('查询座位失败')
        }
      } finally {
        loading.search = false
      }
    }
    
    const selectSeat = (seat) => {
      if (seat.availability_status === 'available') {
        selectedSeat.value = seat
      }
    }
    
    const getSeatStatusText = (status) => {
      const statusMap = {
        'available': '可用',
        'booked': '已预约',
        'maintenance': '维护中'
      }
      return statusMap[status] || status
    }
    
    const confirmBooking = async () => {
      if (!selectedSeat.value) {
        ElMessage.warning('请先选择座位')
        return
      }
      
      try {
        await ElMessageBox.confirm(
          `确认预约 ${selectedSeat.value.room_name} 的 ${selectedSeat.value.seat_number} 座位吗？`,
          '确认预约',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        loading.booking = true
        const token = localStorage.getItem('token')
        
        const bookingData = {
          seat_id: selectedSeat.value.id,
          booking_date: bookingForm.booking_date,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time
        }
        
        const response = await axios.post('/api/bookings', bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        ElMessage.success(`预约成功！获得 ${response.data.points_change} 积分`)
        router.push('/dashboard')
        
      } catch (error) {
        if (error === 'cancel') {
          return
        }
        
        if (error.response) {
          ElMessage.error(error.response.data.error || '预约失败')
        } else {
          ElMessage.error('预约失败')
        }
      } finally {
        loading.booking = false
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadStudyRooms()
    })
    
    return {
      bookingFormRef,
      studyRooms,
      seats,
      selectedSeat,
      hasSearched,
      loading,
      bookingForm,
      bookingRules,
      canSearch,
      goBack,
      disabledDate,
      onDateChange,
      onRoomChange,
      onTimeChange,
      searchSeats,
      selectSeat,
      getSeatStatusText,
      confirmBooking
    }
  }
}
</script>

<style scoped>
.seat-booking {
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

.booking-form {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seat-selection {
  margin-bottom: 20px;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.seat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 2px solid #DCDFE6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
}

.seat-item:hover {
  border-color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.seat-item.available {
  border-color: #67C23A;
}

.seat-item.available:hover {
  border-color: #67C23A;
  background-color: #f0f9ff;
}

.seat-item.booked {
  border-color: #F56C6C;
  background-color: #fef0f0;
  cursor: not-allowed;
}

.seat-item.selected {
  border-color: #409EFF;
  background-color: #ecf5ff;
  transform: scale(1.05);
}

.seat-number {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.seat-status {
  font-size: 12px;
  color: #909399;
}

.seat-actions {
  text-align: center;
}

.no-seats {
  text-align: center;
}
</style> 