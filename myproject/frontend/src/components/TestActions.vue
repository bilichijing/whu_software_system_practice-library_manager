<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>测试功能</span>
      </div>
    </template>
    
    <div class="test-actions">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button 
            type="success" 
            @click="testBookingSuccess"
            :loading="loading.booking"
            block
          >
            模拟预约成功 (+10积分)
          </el-button>
        </el-col>
        
        <el-col :span="8">
          <el-button 
            type="primary" 
            @click="testCheckIn"
            :loading="loading.checkIn"
            block
          >
            模拟按时签到 (+5积分)
          </el-button>
        </el-col>
        
        <el-col :span="8">
          <el-button 
            type="warning" 
            @click="testSubmitRating"
            :loading="loading.rating"
            block
          >
            模拟提交评价 (+3积分)
          </el-button>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-button 
            type="danger" 
            @click="testNoShow"
            :loading="loading.noShow"
            block
          >
            模拟爽约 (-20积分)
          </el-button>
        </el-col>
        
        <el-col :span="8">
          <el-button 
            type="info" 
            @click="testManualAdjust"
            :loading="loading.adjust"
            block
          >
            手动调整积分
          </el-button>
        </el-col>
        
        <el-col :span="8">
          <el-button 
            type="warning" 
            @click="testHighQualityRating"
            :loading="loading.highQuality"
            block
          >
            模拟优质评价 (+5积分)
          </el-button>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'TestActions',
  props: {
    loading: {
      type: Object,
      required: true
    }
  },
  emits: ['booking-success', 'check-in', 'submit-rating', 'no-show', 'manual-adjust', 'high-quality-rating'],
  setup(props, { emit }) {
    const testBookingSuccess = () => {
      emit('booking-success')
    }
    
    const testCheckIn = () => {
      emit('check-in')
    }
    
    const testSubmitRating = () => {
      emit('submit-rating')
    }
    
    const testNoShow = () => {
      emit('no-show')
    }
    
    const testManualAdjust = () => {
      emit('manual-adjust')
    }
    
    const testHighQualityRating = () => {
      emit('high-quality-rating')
    }
    
    return {
      testBookingSuccess,
      testCheckIn,
      testSubmitRating,
      testNoShow,
      testManualAdjust,
      testHighQualityRating
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-actions {
  padding: 10px 0;
}
</style> 