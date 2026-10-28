<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>{{ greeting }}，{{ userStore.user?.name }}！</h2>
        <p>欢迎回到家政服务管理系统，今天也要元气满满哦~</p>
      </div>
      <div class="welcome-icon">
        <el-icon :size="64" color="rgba(255,255,255,0.9)"><Sunny /></el-icon>
      </div>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <div class="stat-card" :style="{ background: card.bg }">
          <div class="stat-icon">
            <el-icon :size="32" color="#fff"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard[card.key] }}</div>
            <div class="stat-title">{{ card.title }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16">
      <el-col :span="14">
        <div class="page-container chart-box">
          <div class="page-header">
            <h2>近 7 日订单趋势</h2>
          </div>
          <div class="week-chart">
            <div class="chart-bars">
              <div class="bar-item" v-for="d in dashboard.weekData" :key="d.date">
                <div class="bar-wrapper">
                  <div class="bar" :style="{ height: barHeight(d.count) + '%' }"></div>
                </div>
                <span class="bar-label">{{ d.date }}</span>
                <span class="bar-value">{{ d.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="page-container chart-box">
          <div class="page-header">
            <h2>订单状态分布</h2>
          </div>
          <div class="status-list">
            <div v-for="s in dashboard.statusDist" :key="s.status" class="status-item">
              <div class="status-left">
                <span class="status-dot" :style="{ background: statusColor(s.status) }"></span>
                <span class="status-label">{{ orderStatusMap[s.status]?.label }}</span>
              </div>
              <div class="status-right">
                <div class="progress">
                  <div class="progress-bar" :style="{ width: statusPercent(s.count) + '%', background: statusColor(s.status) }"></div>
                </div>
                <span class="status-count">{{ s.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快速入口 -->
    <div class="page-container">
      <div class="page-header">
        <h2>快捷操作</h2>
      </div>
      <div class="quick-grid">
        <div class="quick-item" v-for="q in quickActions" :key="q.title" @click="$router.push(q.path)">
          <div class="quick-icon" :style="{ background: q.bg }">
            <el-icon :size="28" color="#fff"><component :is="q.icon" /></el-icon>
          </div>
          <div class="quick-title">{{ q.title }}</div>
          <div class="quick-desc">{{ q.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDashboard } from '@/mock/api.js'
import { orderStatusMap } from '@/mock/data.js'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const dashboard = ref({
  totalOrders: 0, pendingOrders: 0, completedOrders: 0,
  totalCustomers: 0, totalWorkers: 0, idleWorkers: 0,
  totalRevenue: 0, weekData: [], statusDist: []
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const statCards = [
  { title: '订单总数', key: 'totalOrders', icon: 'Tickets', bg: 'linear-gradient(135deg,#66BB6A,#43A047)' },
  { title: '待处理订单', key: 'pendingOrders', icon: 'Clock', bg: 'linear-gradient(135deg,#FFA726,#FB8C00)' },
  { title: '客户总数', key: 'totalCustomers', icon: 'User', bg: 'linear-gradient(135deg,#42A5F5,#1E88E5)' },
  { title: '空闲服务员', key: 'idleWorkers', icon: 'Avatar', bg: 'linear-gradient(135deg,#8D6E63,#6D4C41)' }
]

const quickActions = [
  { title: '预约登记', path: '/order', icon: 'EditPen', bg: 'linear-gradient(135deg,#4CAF50,#2E7D32)', desc: '新建订单预约' },
  { title: '客户建档', path: '/customer', icon: 'UserFilled', bg: 'linear-gradient(135deg,#66BB6A,#388E3C)', desc: '添加客户信息' },
  { title: '服务员档案', path: '/worker', icon: 'Avatar', bg: 'linear-gradient(135deg,#81C784,#43A047)', desc: '新增/管理服务员' },
  { title: '评价录入', path: '/review', icon: 'ChatDotRound', bg: 'linear-gradient(135deg,#A5D6A7,#66BB6A)', desc: '服务评价与投诉' }
]

function barHeight(count) {
  const max = Math.max(...dashboard.value.weekData.map(d => d.count), 1)
  return Math.max(8, (count / max) * 100)
}
function statusColor(s) {
  return { 0: '#FFA726', 1: '#42A5F5', 2: '#66BB6A', 3: '#4CAF50', 4: '#BDBDBD' }[s] || '#999'
}
function statusPercent(c) {
  const total = dashboard.value.statusDist.reduce((s, x) => s + x.count, 0) || 1
  return (c / total) * 100
}

onMounted(async () => {
  dashboard.value = await getDashboard()
})
</script>

<style scoped lang="scss">
.dashboard { padding: 16px; }

.welcome-banner {
  background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #66BB6A 100%);
  border-radius: 12px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.25);

  h2 { margin: 0 0 6px; font-size: 22px; }
  p { margin: 0; font-size: 14px; opacity: 0.9; }
}

.stat-row { margin-bottom: 16px; }
.stat-card {
  border-radius: 12px;
  padding: 20px 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:hover { transform: translateY(-4px); }
  .stat-icon {
    width: 56px; height: 56px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .stat-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
  .stat-title { font-size: 13px; opacity: 0.85; }
}

.chart-box { height: 320px; }
.week-chart { padding: 8px 16px; }
.chart-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 220px; }
.bar-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  flex: 1;
}
.bar-wrapper {
  width: 30px; height: 180px;
  background: #F1F8E9;
  border-radius: 6px;
  display: flex; align-items: flex-end;
  overflow: hidden;
}
.bar {
  width: 100%;
  background: linear-gradient(180deg, #66BB6A, #4CAF50);
  border-radius: 6px 6px 0 0;
  transition: height 0.3s;
}
.bar-label { font-size: 12px; color: #666; }
.bar-value { font-size: 12px; color: #4CAF50; font-weight: 600; }

.status-list { padding: 8px 16px; }
.status-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px dashed #E8F5E9;
  &:last-child { border-bottom: none; }
}
.status-left { display: flex; align-items: center; gap: 10px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.status-label { font-size: 14px; color: #333; }
.status-right { display: flex; align-items: center; gap: 12px; }
.progress { width: 120px; height: 8px; background: #F1F8E9; border-radius: 4px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 4px; transition: width 0.3s; }
.status-count { font-size: 14px; font-weight: 600; color: #2E7D32; width: 24px; text-align: right; }

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.quick-item {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #E8F5E9;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #4CAF50;
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
    transform: translateY(-2px);
  }

  .quick-icon {
    width: 56px; height: 56px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }
  .quick-title { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
  .quick-desc { font-size: 12px; color: #999; }
}
</style>
