<template>
  <el-container class="main-layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
      <div class="logo-bar">
        <el-icon :size="26" color="#fff"><HomeFilled /></el-icon>
        <span v-show="!collapsed" class="logo-text">家政管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#2E7D32"
        text-color="#C8E6C9"
        active-text-color="#fff"
        router
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
        <el-sub-menu v-if="systemChildren.length" index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item v-for="item in systemChildren" :key="item.path" :index="item.path">{{ item.title }}</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon :size="20" class="collapse-btn" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.user?.name || '未登录' }}</span>
              <el-tag size="small" type="success" effect="dark" class="role-tag">{{ userStore.user?.roleName }}</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collapsed = ref(false)

const menuList = [
  { path: '/dashboard', title: '首页概览', icon: 'HomeFilled' },
  { path: '/customer', title: '客户信息管理', icon: 'User' },
  { path: '/worker', title: '服务员管理', icon: 'Avatar' },
  { path: '/order', title: '订单预约管理', icon: 'Tickets' },
  { path: '/review', title: '评价与投诉', icon: 'ChatDotRound' }
]

const systemChildren = [
  { path: '/system/users', title: '用户权限管理' },
  { path: '/system/category', title: '客户/服务类别' },
  { path: '/system/backup', title: '数据备份恢复' }
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/system')) return route.path
  return route.path
})

function handleCommand(cmd) {
  if (cmd === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.main-layout { height: 100vh; }

.aside {
  background: linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%);
  transition: width 0.2s;
  overflow: hidden;

  .logo-bar {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;

    .logo-text {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      white-space: nowrap;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    padding-top: 8px;
  }
  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
    margin: 4px 8px;
    border-radius: 8px;

    &:hover { background: rgba(255, 255, 255, 0.1) !important; }
    &.is-active {
      background: linear-gradient(90deg, #4CAF50, #66BB6A) !important;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    }
  }
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E8F5E9;
  box-shadow: 0 1px 4px rgba(76, 175, 80, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    .collapse-btn {
      cursor: pointer;
      color: #4CAF50;
      &:hover { color: #2E7D32; }
    }
  }

  .header-right .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 20px;
    transition: background 0.2s;

    &:hover { background: #F1F8E9; }

    .avatar { background: #4CAF50; }
    .username { font-size: 14px; color: #333; }
    .role-tag { font-size: 11px; }
  }
}

.main {
  background: #F5F9F5;
  padding: 0;
  overflow-y: auto;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
