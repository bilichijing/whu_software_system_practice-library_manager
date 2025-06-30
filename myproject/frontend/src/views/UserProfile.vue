<template>
  <div class="profile-container">
    <el-container>
      <el-header class="profile-header">
        <div class="header-left">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2>个人中心</h2>
        </div>
      </el-header>
      
      <el-main class="profile-main">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              
              <el-form 
                ref="profileFormRef" 
                :model="profileForm" 
                :rules="rules" 
                label-width="100px"
                @submit.prevent="handleUpdate"
              >
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="用户名">
                      <el-input v-model="profileForm.username" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="真实姓名" prop="real_name">
                      <el-input v-model="profileForm.real_name" placeholder="请输入真实姓名" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="手机号码" prop="phone">
                      <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学号">
                      <el-input v-model="profileForm.student_id" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="注册时间">
                      <el-input v-model="profileForm.created_at" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item>
                  <el-button type="primary" @click="handleUpdate" :loading="loading">
                    保存修改
                  </el-button>
                  <el-button @click="resetForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>头像设置</span>
                </div>
              </template>
              
              <div class="avatar-section">
                <div class="avatar-display">
                  <el-avatar :size="120" :src="profileForm.avatar">
                    {{ profileForm.username?.charAt(0).toUpperCase() }}
                  </el-avatar>
                </div>
                
                <div class="avatar-upload">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    :http-request="handleAvatarUpload"
                  >
                    <el-button type="primary" size="small">
                      更换头像
                    </el-button>
                  </el-upload>
                  <p class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                </div>
              </div>
            </el-card>
            
            <el-card style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>账户安全</span>
                </div>
              </template>
              
              <div class="security-section">
                <div class="security-item">
                  <div class="security-info">
                    <h4>修改密码</h4>
                    <p>定期更换密码，保护账户安全</p>
                  </div>
                  <el-button type="primary" size="small" @click="showChangePassword">
                    修改
                  </el-button>
                </div>
                
                <div class="security-item">
                  <div class="security-info">
                    <h4>绑定手机</h4>
                    <p>{{ profileForm.phone ? '已绑定' : '未绑定' }}</p>
                  </div>
                  <el-button type="primary" size="small" @click="showBindPhone">
                    {{ profileForm.phone ? '更换' : '绑定' }}
                  </el-button>
                </div>
                
                <div class="security-item">
                  <div class="security-info">
                    <h4>绑定邮箱</h4>
                    <p>{{ profileForm.email ? '已绑定' : '未绑定' }}</p>
                  </div>
                  <el-button type="primary" size="small" @click="showBindEmail">
                    {{ profileForm.email ? '更换' : '绑定' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
            确认修改
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
import { ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'

export default {
  name: 'UserProfile',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const profileForm = reactive({
      username: '',
      real_name: '',
      email: '',
      phone: '',
      student_id: '',
      avatar: '',
      created_at: ''
    })
    
    const loading = ref(false)
    const profileFormRef = ref()
    
    // 修改密码相关
    const passwordDialogVisible = ref(false)
    const passwordLoading = ref(false)
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    const passwordFormRef = ref()
    
    // 表单验证规则
    const validateEmail = (rule, value, callback) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      } else {
        callback()
      }
    }
    
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    const rules = {
      real_name: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
      ],
      email: [
        { validator: validateEmail, trigger: 'blur' }
      ],
      phone: [
        { validator: validatePhone, trigger: 'blur' }
      ]
    }
    
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }
    
    // 加载用户信息
    const loadUserInfo = async () => {
      try {
        const response = await axios.get('/api/user/profile')
        Object.assign(profileForm, response.data.user)
      } catch (error) {
        ElMessage.error('获取用户信息失败')
      }
    }
    
    // 更新用户信息
    const handleUpdate = async () => {
      try {
        await profileFormRef.value.validate()
        loading.value = true
        
        const updateData = {
          email: profileForm.email,
          real_name: profileForm.real_name,
          phone: profileForm.phone,
          avatar: profileForm.avatar
        }
        
        await axios.put('/api/user/profile', updateData)
        ElMessage.success('用户信息更新成功')
      } catch (error) {
        if (error.response) {
          ElMessage.error(error.response.data.error || '更新失败')
        } else {
          ElMessage.error('网络错误，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }
    
    // 重置表单
    const resetForm = () => {
      loadUserInfo()
    }
    
    // 头像上传前验证
    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        ElMessage.error('头像只能是 JPG 或 PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('头像大小不能超过 2MB!')
        return false
      }
      return true
    }
    
    // 处理头像上传
    const handleAvatarUpload = (options) => {
      // 这里应该上传到服务器，现在只是模拟
      const reader = new FileReader()
      reader.onload = (e) => {
        profileForm.avatar = e.target.result
        ElMessage.success('头像上传成功')
      }
      reader.readAsDataURL(options.file)
    }
    
    // 显示修改密码对话框
    const showChangePassword = () => {
      passwordDialogVisible.value = true
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
    
    // 处理修改密码
    const handleChangePassword = async () => {
      try {
        await passwordFormRef.value.validate()
        passwordLoading.value = true
        
        // 这里应该调用修改密码的API
        ElMessage.success('密码修改成功')
        passwordDialogVisible.value = false
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
    
    // 显示绑定手机对话框
    const showBindPhone = () => {
      ElMessage.info('绑定手机功能开发中...')
    }
    
    // 显示绑定邮箱对话框
    const showBindEmail = () => {
      ElMessage.info('绑定邮箱功能开发中...')
    }
    
    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }
    
    onMounted(() => {
      loadUserInfo()
    })
    
    return {
      profileForm,
      loading,
      rules,
      profileFormRef,
      passwordDialogVisible,
      passwordLoading,
      passwordForm,
      passwordRules,
      passwordFormRef,
      handleUpdate,
      resetForm,
      beforeAvatarUpload,
      handleAvatarUpload,
      showChangePassword,
      handleChangePassword,
      showBindPhone,
      showBindEmail,
      goBack
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.profile-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.profile-main {
  padding: 20px;
}

.card-header {
  font-weight: 500;
  color: #303133;
}

.avatar-section {
  text-align: center;
}

.avatar-display {
  margin-bottom: 20px;
}

.avatar-upload {
  margin-top: 15px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

.security-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.security-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 14px;
}

.security-info p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 