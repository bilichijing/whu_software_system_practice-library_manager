<template>
  <div class="rating-management">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">评价管理</span>
      </template>
    </el-page-header>

    <div class="content-container">
      <!-- 评价统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total_ratings || 0 }}</div>
              <div class="stat-label">总评价数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.avg_rating || 0 }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.high_ratings || 0 }}</div>
              <div class="stat-label">好评数(4-5星)</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.low_ratings || 0 }}</div>
              <div class="stat-label">差评数(1-2星)</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 标签统计 -->
      <el-card class="tags-stats-card">
        <template #header>
          <div class="card-header">
            <span>热门标签</span>
          </div>
        </template>
        
        <div class="tags-stats">
          <el-tag
            v-for="(count, tag) in topTags"
            :key="tag"
            :type="getTagType(count)"
            size="large"
            style="margin: 8px;"
          >
            {{ tag }} ({{ count }})
          </el-tag>
        </div>
      </el-card>

      <!-- 评价记录列表 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的评价记录</span>
            <el-button type="primary" @click="showRatingDialog">
              提交新评价
            </el-button>
          </div>
        </template>
        
        <div v-if="ratings.length === 0" class="empty-ratings">
          <el-empty description="暂无评价记录">
            <el-button type="primary" @click="showRatingDialog">立即评价</el-button>
          </el-empty>
        </div>
        <div v-else>
          <div 
            v-for="rating in ratings" 
            :key="rating.id"
            class="rating-item"
          >
            <div class="rating-header">
              <div class="rating-info">
                <div class="rating-score">
                  <el-rate 
                    :model-value="rating.rating" 
                    disabled 
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <div class="rating-meta">
                  <span class="rating-date">{{ formatDate(rating.created_at) }}</span>
                  <span v-if="rating.room_name" class="rating-location">
                    {{ rating.room_name }} - {{ rating.seat_number }}
                  </span>
                </div>
              </div>
              <div class="rating-type">
                <el-tag :type="getRatingTypeColor(rating.rating_type)">
                  {{ getRatingTypeText(rating.rating_type) }}
                </el-tag>
              </div>
            </div>
            
            <div v-if="rating.tags && rating.tags.length > 0" class="rating-tags">
              <el-tag
                v-for="tag in rating.tags"
                :key="tag"
                size="small"
                style="margin: 2px;"
              >
                {{ tag }}
              </el-tag>
            </div>
            
            <div v-if="rating.comment" class="rating-comment">
              {{ rating.comment }}
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 评价对话框 -->
    <RatingDialog
      v-model="ratingDialogVisible"
      title="提交评价"
      @submitted="onRatingSubmitted"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import RatingDialog from '@/components/RatingDialog.vue'

export default {
  name: 'RatingManagement',
  components: {
    RatingDialog
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const ratings = ref([])
    const stats = ref({})
    const tagCounts = ref({})
    const ratingDialogVisible = ref(false)
    
    // 计算属性
    const topTags = computed(() => {
      const sortedTags = Object.entries(tagCounts.value)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
      
      return Object.fromEntries(sortedTags)
    })
    
    // 方法
    const goBack = () => {
      router.push('/dashboard')
    }
    
    const loadRatings = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/user/ratings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        ratings.value = response.data.ratings
      } catch (error) {
        ElMessage.error('获取评价记录失败')
      }
    }
    
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/ratings/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        stats.value = response.data.stats
        tagCounts.value = response.data.tagCounts
      } catch (error) {
        ElMessage.error('获取评价统计失败')
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN')
    }
    
    const getTagType = (count) => {
      if (count >= 10) return 'danger'
      if (count >= 5) return 'warning'
      if (count >= 3) return 'success'
      return 'info'
    }
    
    const getRatingTypeColor = (type) => {
      const colorMap = {
        'general': 'info',
        'booking': 'primary',
        'service': 'success',
        'facility': 'warning'
      }
      return colorMap[type] || 'info'
    }
    
    const getRatingTypeText = (type) => {
      const textMap = {
        'general': '一般评价',
        'booking': '预约评价',
        'service': '服务评价',
        'facility': '设施评价'
      }
      return textMap[type] || '一般评价'
    }
    
    const showRatingDialog = () => {
      ratingDialogVisible.value = true
    }
    
    const onRatingSubmitted = () => {
      loadRatings()
      loadStats()
    }
    
    // 生命周期
    onMounted(() => {
      loadRatings()
      loadStats()
    })
    
    return {
      ratings,
      stats,
      tagCounts,
      ratingDialogVisible,
      topTags,
      goBack,
      loadRatings,
      loadStats,
      formatDate,
      getTagType,
      getRatingTypeColor,
      getRatingTypeText,
      showRatingDialog,
      onRatingSubmitted
    }
  }
}
</script>

<style scoped>
.rating-management {
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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.tags-stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-ratings {
  padding: 40px 0;
  text-align: center;
}

.rating-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: white;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rating-info {
  flex: 1;
}

.rating-score {
  margin-bottom: 8px;
}

.rating-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.rating-location {
  color: #409eff;
}

.rating-tags {
  margin-bottom: 12px;
}

.rating-comment {
  color: #606266;
  line-height: 1.6;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
}
</style> 