<template>
  <el-card class="level-benefits">
    <template #header>
      <div class="card-header">
        <span>等级权益</span>
      </div>
    </template>
    
    <div class="benefits-list">
      <div 
        v-for="(benefit, index) in benefits" 
        :key="index"
        class="benefit-item"
      >
        <el-icon><Check /></el-icon>
        <span>{{ benefit }}</span>
      </div>
    </div>
  </el-card>
</template>

<script>
import { Check } from '@element-plus/icons-vue'

export default {
  name: 'LevelBenefits',
  components: {
    Check
  },
  props: {
    benefits: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.level-benefits {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.benefit-item .el-icon {
  color: #67C23A;
}
</style> 