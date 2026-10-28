import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '首页概览', icon: 'HomeFilled' } },
      { path: 'customer', name: 'Customer', component: () => import('@/views/customer/CustomerList.vue'), meta: { title: '客户信息管理', icon: 'User' } },
      { path: 'worker', name: 'Worker', component: () => import('@/views/worker/WorkerList.vue'), meta: { title: '服务员信息管理', icon: 'Avatar' } },
      { path: 'order', name: 'Order', component: () => import('@/views/order/OrderList.vue'), meta: { title: '订单预约管理', icon: 'Tickets' } },
      { path: 'review', name: 'Review', component: () => import('@/views/review/ReviewList.vue'), meta: { title: '评价与投诉管理', icon: 'ChatDotRound' } },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          { path: 'users', name: 'SystemUsers', component: () => import('@/views/system/UserManage.vue'), meta: { title: '用户权限管理' } },
          { path: 'category', name: 'SystemCategory', component: () => import('@/views/system/CategoryManage.vue'), meta: { title: '客户/服务类别' } },
          { path: 'backup', name: 'SystemBackup', component: () => import('@/views/system/BackupManage.vue'), meta: { title: '数据备份恢复' } }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('hss_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
