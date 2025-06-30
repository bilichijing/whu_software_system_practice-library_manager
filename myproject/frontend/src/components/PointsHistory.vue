<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>积分历史记录</span>
        <el-button type="text" @click="$emit('refresh')">刷新</el-button>
      </div>
    </template>
    
    <div v-if="history.length === 0" class="empty-history">
      <el-empty description="暂无积分记录" />
    </div>
    <div v-else>
      <el-table :data="history" style="width: 100%">
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="action_type" label="操作类型" width="150">
          <template #default="scope">
            <el-tag :type="getActionTypeColor(scope.row.action_type)">
              {{ getActionTypeName(scope.row.action_type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="points_change" label="积分变动" width="120">
          <template #default="scope">
            <span :class="scope.row.points_change >= 0 ? 'positive' : 'negative'">
              {{ scope.row.points_change >= 0 ? '+' : '' }}{{ scope.row.points_change }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="points_before" label="变动前" width="100" />
        <el-table-column prop="points_after" label="变动后" width="100" />
        
        <el-table-column prop="action_description" label="描述" />
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
</template>

<script>
export default {
  name: 'PointsHistory',
  props: {
    history: {
      type: Array,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  emits: ['refresh', 'size-change', 'current-change'],
  setup(props, { emit }) {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-CN')
    }
    
    const getActionTypeColor = (actionType) => {
      const colorMap = {
        'booking_success': 'success',
        'check_in_on_time': 'success',
        'submit_rating': 'primary',
        'high_quality_rating': 'success',
        'no_show': 'danger',
        'illegal_occupation': 'danger',
        'early_cancel': 'warning',
        'manual_adjust': 'info'
      }
      return colorMap[actionType] || 'info'
    }
    
    const getActionTypeName = (actionType) => {
      const nameMap = {
        'booking_success': '预约成功',
        'check_in_on_time': '按时签到',
        'submit_rating': '提交评价',
        'high_quality_rating': '优质评价',
        'no_show': '爽约扣除',
        'illegal_occupation': '违规占座',
        'early_cancel': '提前取消',
        'manual_adjust': '手动调整'
      }
      return nameMap[actionType] || actionType
    }
    
    const handleSizeChange = (val) => {
      emit('size-change', val)
    }
    
    const handleCurrentChange = (val) => {
      emit('current-change', val)
    }
    
    return {
      formatDate,
      getActionTypeColor,
      getActionTypeName,
      handleSizeChange,
      handleCurrentChange
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

.empty-history {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.positive {
  color: #67C23A;
  font-weight: bold;
}

.negative {
  color: #F56C6C;
  font-weight: bold;
}
</style> 