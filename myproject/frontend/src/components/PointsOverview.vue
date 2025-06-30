<template>
  <el-card class="points-overview">
    <template #header>
      <div class="card-header">
        <span>积分概览</span>
        <el-button type="text" @click="$emit('refresh')">刷新</el-button>
      </div>
    </template>
    
    <div class="points-display">
      <div class="points-number">{{ pointsLevel.points || 0 }}</div>
      <div class="points-label">当前积分</div>
    </div>
    
    <el-divider />
    
    <div class="level-info">
      <div class="level-badge" :class="pointsLevel.level">
        {{ pointsLevel.levelName }}
      </div>
      <div class="level-progress" v-if="pointsLevel.nextLevel">
        <div class="progress-text">
          距离{{ pointsLevel.nextLevel }}还需 {{ pointsLevel.pointsToNext }} 积分
        </div>
        <el-progress 
          :percentage="getProgressPercentage()" 
          :color="getProgressColor()"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'PointsOverview',
  props: {
    pointsLevel: {
      type: Object,
      required: true
    }
  },
  emits: ['refresh'],
  setup(props) {
    const getProgressPercentage = () => {
      if (!props.pointsLevel.nextLevel) return 100
      const current = props.pointsLevel.points
      const target = props.pointsLevel.points + props.pointsLevel.pointsToNext
      return Math.round((current / target) * 100)
    }
    
    const getProgressColor = () => {
      const percentage = getProgressPercentage()
      if (percentage >= 80) return '#67C23A'
      if (percentage >= 60) return '#E6A23C'
      return '#F56C6C'
    }
    
    return {
      getProgressPercentage,
      getProgressColor
    }
  }
}
</script>

<style scoped>
.points-overview {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-display {
  text-align: center;
  margin-bottom: 20px;
}

.points-number {
  font-size: 48px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.points-label {
  color: #909399;
  font-size: 14px;
}

.level-info {
  text-align: center;
}

.level-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  margin-bottom: 15px;
}

.level-badge.bronze {
  background: linear-gradient(135deg, #cd7f32, #daa520);
}

.level-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
}

.level-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffa500);
}

.level-badge.diamond {
  background: linear-gradient(135deg, #b9f2ff, #87ceeb);
}

.level-progress {
  margin-top: 15px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
</style> 