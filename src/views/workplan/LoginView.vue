<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>工作计划管理系统</h1>
        <p>高效管理计划，提升工作效率</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input 
              v-model="loginForm.captcha" 
              placeholder="请输入验证码"
              prefix-icon="Key"
              size="large"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <span>{{ captchaCode }}</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" size="large" class="login-btn">
            登 录
          </el-button>
        </el-form-item>
        
        <div class="login-links">
          <router-link to="/">忘记密码？</router-link>
          <router-link to="/">立即注册</router-link>
        </div>
      </el-form>
      
      <div class="role-selector">
        <span>登录角色：</span>
        <el-radio-group v-model="loginForm.role">
          <el-radio label="employee">普通员工</el-radio>
          <el-radio label="manager">部门主管</el-radio>
          <el-radio label="admin">系统管理员</el-radio>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaCode = ref('AB12')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  role: 'employee'
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  captchaCode.value = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const handleLogin = async () => {
  await loginFormRef.value?.validate()
  loading.value = true
  
  setTimeout(() => {
    localStorage.setItem('workplan_token', 'mock_token')
    localStorage.setItem('workplan_role', loginForm.role)
    localStorage.setItem('workplan_user', JSON.stringify({ username: loginForm.username, role: loginForm.role }))
    loading.value = false
    router.push('/')
  }, 1000)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.captcha-row {
  display: flex;
  gap: 12px;
}

.captcha-image {
  width: 120px;
  height: 48px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 8px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.login-btn {
  width: 100%;
}

.login-links {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.login-links a {
  color: #667eea;
  text-decoration: none;
}

.login-links a:hover {
  text-decoration: underline;
}

.role-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}
</style>
