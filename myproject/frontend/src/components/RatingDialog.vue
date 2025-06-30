<template>
  <el-dialog 
    v-model="visible" 
    :title="title" 
    width="600px"
    :before-close="handleClose"
  >
    <el-form 
      ref="ratingFormRef" 
      :model="ratingForm" 
      :rules="ratingRules" 
      label-width="100px"
    >
      <el-form-item label="总体评分" prop="rating">
        <div class="rating-section">
          <el-rate 
            v-model="ratingForm.rating" 
            :max="5" 
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            show-text
            :texts="['很差', '较差', '一般', '较好', '很好']"
          />
        </div>
      </el-form-item>

      <el-form-item label="评价标签">
        <div class="tags-section">
          <div v-for="(tags, category) in availableTags" :key="category" class="tag-category">
            <div class="category-title">{{ getCategoryTitle(category) }}</div>
            <div class="tag-list">
              <el-check-tag
                v-for="tag in tags"
                :key="tag"
                :checked="ratingForm.tags.includes(tag)"
                @change="toggleTag(tag)"
                style="margin: 4px;"
              >
                {{ tag }}
              </el-check-tag>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="详细评价" prop="comment">
        <el-input 
          v-model="ratingForm.comment"
          type="textarea" 
          :rows="4"
          placeholder="请详细描述您的使用体验（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitRating" :loading="loading">
          提交评价
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'RatingDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '服务评价'
    },
    bookingId: {
      type: [Number, String],
      default: null
    },
    ratingType: {
      type: String,
      default: 'general'
    }
  },
  emits: ['update:modelValue', 'submitted'],
  setup(props, { emit }) {
    const ratingFormRef = ref()
    const loading = ref(false)
    const availableTags = ref({})

    const ratingForm = reactive({
      rating: 5,
      comment: '',
      tags: []
    })

    const ratingRules = {
      rating: [
        { required: true, message: '请选择评分', trigger: 'change' }
      ]
    }

    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const getCategoryTitle = (category) => {
      const titles = {
        facility: '设施设备',
        service: '服务质量',
        environment: '环境体验',
        experience: '使用体验'
      }
      return titles[category] || category
    }

    const toggleTag = (tag) => {
      const index = ratingForm.tags.indexOf(tag)
      if (index > -1) {
        ratingForm.tags.splice(index, 1)
      } else {
        ratingForm.tags.push(tag)
      }
    }

    const loadAvailableTags = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/ratings/tags', {
          headers: { Authorization: `Bearer ${token}` }
        })
        availableTags.value = response.data.tags
      } catch (error) {
        console.error('获取评价标签失败:', error)
      }
    }

    const handleClose = () => {
      visible.value = false
    }

    const submitRating = async () => {
      try {
        await ratingFormRef.value.validate()
        
        loading.value = true
        const token = localStorage.getItem('token')
        
        const ratingData = {
          rating: ratingForm.rating,
          comment: ratingForm.comment,
          tags: ratingForm.tags,
          bookingId: props.bookingId,
          ratingType: props.ratingType
        }
        
        const response = await axios.post('/api/user/rating', ratingData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        ElMessage.success(`评价提交成功！获得 ${response.data.pointsResult.pointsChange} 积分`)
        emit('submitted', response.data)
        handleClose()
        
        // 重置表单
        ratingForm.rating = 5
        ratingForm.comment = ''
        ratingForm.tags = []
        
      } catch (error) {
        if (error.response) {
          ElMessage.error(error.response.data.error || '评价提交失败')
        } else {
          ElMessage.error('评价提交失败')
        }
      } finally {
        loading.value = false
      }
    }

    // 监听visible变化，加载标签
    watch(visible, (newVal) => {
      if (newVal) {
        loadAvailableTags()
      }
    })

    return {
      ratingFormRef,
      loading,
      availableTags,
      ratingForm,
      ratingRules,
      visible,
      getCategoryTitle,
      toggleTag,
      handleClose,
      submitRating
    }
  }
}
</script>

<style scoped>
.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tags-section {
  max-height: 300px;
  overflow-y: auto;
}

.tag-category {
  margin-bottom: 20px;
}

.category-title {
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
  font-size: 14px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 