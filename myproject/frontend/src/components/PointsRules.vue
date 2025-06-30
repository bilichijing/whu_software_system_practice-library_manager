<template>
  <el-card class="points-rules">
    <template #header>
      <div class="card-header">
        <span>积分规则</span>
        <el-button link @click="$emit('refresh')">刷新</el-button>
      </div>
    </template>
    
    <div class="rules-list">
      <div 
        v-for="rule in rules" 
        :key="rule.id"
        class="rule-item"
      >
        <div class="rule-header">
          <span class="rule-name">{{ rule.rule_name }}</span>
          <span class="rule-points" :class="rule.points_change >= 0 ? 'positive' : 'negative'">
            {{ rule.points_change >= 0 ? '+' : '' }}{{ rule.points_change }}
          </span>
        </div>
        <div class="rule-description">{{ rule.description }}</div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'PointsRules',
  props: {
    rules: {
      type: Array,
      required: true
    }
  },
  emits: ['refresh']
}
</script>

<style scoped>
.points-rules {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rules-list {
  max-height: 300px;
  overflow-y: auto;
}

.rule-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.rule-name {
  font-weight: 500;
  color: #303133;
}

.rule-points {
  font-weight: bold;
  font-size: 14px;
}

.rule-points.positive {
  color: #67C23A;
}

.rule-points.negative {
  color: #F56C6C;
}

.rule-description {
  font-size: 12px;
  color: #909399;
}
</style> 