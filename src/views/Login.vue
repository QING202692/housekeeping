<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#fff"><HomeFilled /></el-icon>
        <h1>家政服务管理系统</h1>
        <p>Home Service Management System</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @submit.prevent>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">登 录</el-button>
        <div class="tips">
          <span>默认账号：admin / 123456</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/mock/api.js'
import { useUserStore } from '@/store/user.js'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: 'admin', password: '123456' })
const formRef = ref(null)
const loading = ref(false)
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  await formRef.value.validate().catch(() => {})
  loading.value = true
  try {
    const res = await login(form.value)
    userStore.setLogin(res)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-wrap {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    top: -200px; left: -200px;
  }
  &::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    bottom: -100px; right: -100px;
  }
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(46, 125, 50, 0.3);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-header {
  background: linear-gradient(135deg, #388E3C, #4CAF50);
  padding: 32px 24px;
  text-align: center;
  color: #fff;

  h1 { margin: 12px 0 4px; font-size: 24px; letter-spacing: 2px; }
  p { margin: 0; font-size: 12px; opacity: 0.85; letter-spacing: 1px; }
}

.login-form {
  padding: 28px 36px 20px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  border: none;
  &:hover { background: linear-gradient(135deg, #43A047, #2E7D32); }
}

.tips {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>
