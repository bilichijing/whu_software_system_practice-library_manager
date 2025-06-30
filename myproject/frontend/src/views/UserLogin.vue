<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>图书馆座位预约系统</h2>
        <p>请登录您的账户</p>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="rules" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="login-options">
          <el-button link @click="goToRegister">
            还没有账户？立即注册
          </el-button>
        </div>
        
        <!-- 第三方登录选项 -->
        <div class="third-party-login">
          <el-divider>或使用以下方式登录</el-divider>
          <div class="third-party-buttons">
            <el-button 
              type="success" 
              icon="el-icon-school"
              @click="campusLogin"
            >
              校园账号登录
            </el-button>
          </div>
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
  name: 'UserLogin',
  setup() {
    const router = useRouter()
    const loginForm = reactive({
      username: '',
      password: ''
    })
    
    const loading = ref(false)
    const loginFormRef = ref()
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    const handleLogin = async () => {
      try {
        await loginFormRef.value.validate()
        loading.value = true
        
        const response = await axios.post('/api/login', loginForm)
        
        // 保存token和用户信息
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        ElMessage.success('登录成功！')
        router.push('/dashboard')
      } catch (error) {
        if (error.response) {
          ElMessage.error(error.response.data.error || '登录失败')
        } else {
          ElMessage.error('网络错误，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }
    
    const goToRegister = () => {
      router.push('/register')
    }
    
    const campusLogin = () => {
      ElMessage.info('校园账号登录功能开发中...')
    }
    
    return {
      loginForm,
      loading,
      rules,
      loginFormRef,
      handleLogin,
      goToRegister,
      campusLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.login-options {
  text-align: center;
  margin-top: 15px;
}

.third-party-login {
  margin-top: 30px;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.third-party-buttons .el-button {
  margin: 0 10px;
}
</style> 