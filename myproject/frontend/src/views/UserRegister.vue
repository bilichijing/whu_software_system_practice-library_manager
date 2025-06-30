<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建您的图书馆座位预约账户</p>
      </div>
      
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="rules" 
        class="register-form"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名（3-20个字符）"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（6-20个字符）"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
          />
        </el-form-item>
        
        <el-form-item label="真实姓名" prop="real_name">
          <el-input
            v-model="registerForm.real_name"
            placeholder="请输入真实姓名"
          />
        </el-form-item>
        
        <el-form-item label="学号" prop="student_id">
          <el-input
            v-model="registerForm.student_id"
            placeholder="请输入学号（可选）"
          />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="register-options">
          <el-button link @click="goToLogin">
            已有账户？立即登录
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'UserRegister',
  setup() {
    const router = useRouter()
    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      real_name: '',
      student_id: '',
      phone: ''
    })
    
    const loading = ref(false)
    const registerFormRef = ref()
    
    // 自定义验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
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
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ],
      email: [
        { validator: validateEmail, trigger: 'blur' }
      ],
      real_name: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
      ],
      phone: [
        { validator: validatePhone, trigger: 'blur' }
      ]
    }
    
    const handleRegister = async () => {
      try {
        await registerFormRef.value.validate()
        loading.value = true
        
        // eslint-disable-next-line no-unused-vars
        const { confirmPassword, ...registerData } = registerForm
        
        const response = await axios.post('/api/register', registerData)
        
        // 保存token和用户信息
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        ElMessage.success('注册成功！')
        router.push('/dashboard')
      } catch (error) {
        if (error.response) {
          ElMessage.error(error.response.data.error || '注册失败')
        } else {
          ElMessage.error('网络错误，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      registerForm,
      loading,
      rules,
      registerFormRef,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 500px;
  max-width: 100%;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

.register-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.register-options {
  text-align: center;
  margin-top: 15px;
}
</style> 