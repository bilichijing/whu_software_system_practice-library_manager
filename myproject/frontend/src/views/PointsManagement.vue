<template>
  <div class="points-management">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">积分管理</span>
      </template>
    </el-page-header>

    <div class="content-container">
      <!-- 第一行：积分概览和等级权益 -->
      <el-row :gutter="20" class="top-row">
        <el-col :span="12">
          <PointsOverview 
            :points-level="pointsLevel" 
            @refresh="loadPointsLevel"
          />
        </el-col>
        <el-col :span="12">
          <LevelBenefits :benefits="currentBenefits" />
        </el-col>
      </el-row>

      <!-- 第二行：积分规则 -->
      <el-row :gutter="20" class="middle-row">
        <el-col :span="24">
          <PointsRules 
            :rules="pointsRules" 
            @refresh="loadPointsRules"
          />
        </el-col>
      </el-row>

      <!-- 第三行：积分历史 -->
      <el-row :gutter="20" class="bottom-row">
        <el-col :span="24">
          <PointsHistory 
            :history="pointsHistory"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @refresh="loadPointsHistory"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 手动调整积分对话框 -->
    <el-dialog v-model="adjustDialogVisible" title="手动调整积分" width="400px">
      <el-form :model="adjustForm" label-width="100px">
        <el-form-item label="调整积分">
          <el-input-number 
            v-model="adjustForm.points" 
            :min="-1000" 
            :max="1000"
            placeholder="请输入积分调整值"
          />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input 
            v-model="adjustForm.reason" 
            type="textarea" 
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdjust" :loading="loading.adjust">
            确认调整
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import PointsOverview from '@/components/PointsOverview.vue'
import LevelBenefits from '@/components/LevelBenefits.vue'
import PointsRules from '@/components/PointsRules.vue'
import PointsHistory from '@/components/PointsHistory.vue'

export default {
  name: 'PointsManagement',
  components: {
    PointsOverview,
    LevelBenefits,
    PointsRules,
    PointsHistory
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const pointsLevel = ref({})
    const pointsRules = ref([])
    const pointsHistory = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const adjustDialogVisible = ref(false)
    
    const loading = reactive({
      booking: false,
      checkIn: false,
      rating: false,
      noShow: false,
      adjust: false,
      highQuality: false
    })
    
    const adjustForm = reactive({
      points: 0,
      reason: ''
    })
    
    // 等级权益配置
    const levelBenefits = {
      bronze: ['基础预约权限', '查看积分历史'],
      silver: ['优先预约', '积分兑换', '查看积分历史'],
      gold: ['VIP预约', '积分兑换', '专属客服', '查看积分历史'],
      diamond: ['超级VIP预约', '积分兑换', '专属客服', '生日特权', '查看积分历史']
    }
    
    const currentBenefits = ref([])
    
    // 方法
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const loadPointsLevel = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/user/points/level', {
          headers: { Authorization: `Bearer ${token}` }
        })
        pointsLevel.value = response.data
        currentBenefits.value = levelBenefits[response.data.level] || []
      } catch (error) {
        ElMessage.error('获取积分等级信息失败')
      }
    }
    
    const loadPointsRules = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/points/rules', {
          headers: { Authorization: `Bearer ${token}` }
        })
        pointsRules.value = response.data.rules
      } catch (error) {
        ElMessage.error('获取积分规则失败')
      }
    }
    
    const loadPointsHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/user/points/history', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage.value,
            limit: pageSize.value
          }
        })
        pointsHistory.value = response.data.history
        total.value = response.data.pagination.total
      } catch (error) {
        ElMessage.error('获取积分历史失败')
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadPointsHistory()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadPointsHistory()
    }
    
    // 生命周期
    onMounted(() => {
      loadPointsLevel()
      loadPointsRules()
      loadPointsHistory()
    })
    
    return {
      pointsLevel,
      pointsRules,
      pointsHistory,
      currentPage,
      pageSize,
      total,
      loading,
      adjustDialogVisible,
      adjustForm,
      currentBenefits,
      goBack,
      loadPointsLevel,
      loadPointsRules,
      loadPointsHistory,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.points-management {
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

.top-row {
  margin-bottom: 20px;
}

.middle-row {
  margin-bottom: 20px;
}

.bottom-row {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 