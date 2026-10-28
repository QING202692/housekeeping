// 简单的 Mock API 封装，用 Promise 模拟异步请求
import { customers, workers, orders, reviews, customerCategories, serviceCategories, sysUsers, roles } from './data.js'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// 深拷贝避免污染原始数据
let state = JSON.parse(JSON.stringify({
  customers, workers, orders, reviews, customerCategories, serviceCategories, sysUsers, roles
}))

// ===== 登录 =====
export async function login({ username, password }) {
  await delay()
  const u = state.sysUsers.find(u => u.username === username && u.password === password)
  if (u) {
    const role = state.roles.find(r => r.id === u.roleId)
    return { token: 'mock-token-' + u.id, user: { ...u, roleName: role?.name } }
  }
  throw new Error('用户名或密码错误')
}

// ===== 客户 =====
export async function getCustomers(params = {}) {
  await delay()
  let list = state.customers
  if (params.keyword) {
    const kw = params.keyword.trim()
    list = list.filter(c => c.id.includes(kw) || c.name.includes(kw) || c.phone.includes(kw))
  }
  if (params.categoryId) list = list.filter(c => c.categoryId === Number(params.categoryId))
  return { total: list.length, list }
}
export async function saveCustomer(data) {
  await delay()
  if (data.id) {
    const idx = state.customers.findIndex(c => c.id === data.id)
    if (idx >= 0) state.customers[idx] = { ...state.customers[idx], ...data }
  } else {
    const newId = 'C' + Date.now().toString().slice(-8)
    state.customers.unshift({ ...data, id: newId, registerDate: new Date().toISOString().slice(0, 10), orderCount: 0, totalConsume: 0 })
  }
  return true
}
export async function deleteCustomer(id) {
  await delay()
  const hasOrder = state.orders.some(o => o.customerId === id && o.status !== 3 && o.status !== 4)
  if (hasOrder) throw new Error('该客户存在未完成订单，无法删除')
  state.customers = state.customers.filter(c => c.id !== id)
  return true
}

// ===== 服务员 =====
export async function getWorkers(params = {}) {
  await delay()
  let list = state.workers
  if (params.keyword) {
    const kw = params.keyword.trim()
    list = list.filter(w => w.id.includes(kw) || w.name.includes(kw) || w.phone.includes(kw))
  }
  if (params.serviceCategoryId) list = list.filter(w => w.serviceCategoryId === Number(params.serviceCategoryId))
  if (params.status !== undefined && params.status !== '') list = list.filter(w => w.status === Number(params.status))
  return { total: list.length, list }
}
export async function saveWorker(data) {
  await delay()
  if (data.id) {
    const idx = state.workers.findIndex(w => w.id === data.id)
    if (idx >= 0) state.workers[idx] = { ...state.workers[idx], ...data }
  } else {
    const newId = 'W' + Date.now().toString().slice(-8)
    state.workers.unshift({ ...data, id: newId, registerDate: new Date().toISOString().slice(0, 10), rating: 0, status: 0 })
  }
  return true
}
export async function deleteWorker(id) {
  await delay()
  const hasOrder = state.orders.some(o => o.workerId === id && o.status !== 3 && o.status !== 4)
  if (hasOrder) throw new Error('该服务员存在未完成订单，无法删除')
  state.workers = state.workers.filter(w => w.id !== id)
  return true
}
// 智能推荐
export async function recommendWorkers({ serviceCategoryId, expectDate }) {
  await delay()
  const list = state.workers
    .filter(w => w.serviceCategoryId === Number(serviceCategoryId) && w.status === 0)
    .sort((a, b) => b.rating - a.rating)
  return list.slice(0, 5)
}

// ===== 订单 =====
export async function getOrders(params = {}) {
  await delay()
  let list = state.orders
  if (params.keyword) {
    const kw = params.keyword.trim()
    list = list.filter(o => o.id.includes(kw) || o.customerId.includes(kw) || o.workerId?.includes(kw))
  }
  if (params.status !== undefined && params.status !== '') list = list.filter(o => o.status === Number(params.status))
  if (params.categoryId) list = list.filter(o => o.categoryId === Number(params.categoryId))
  // 关联补充
  const enriched = list.map(o => {
    const c = state.customers.find(c => c.id === o.customerId)
    const w = state.workers.find(w => w.id === o.workerId)
    const cat = state.serviceCategories.find(c => c.id === o.categoryId)
    return {
      ...o,
      customerName: c?.name || '-',
      workerName: w?.name || '未派单',
      categoryName: cat?.name || '-',
      customerCategoryId: c?.categoryId
    }
  })
  return { total: enriched.length, list: enriched }
}
export async function saveOrder(data) {
  await delay()
  if (data.id) {
    const idx = state.orders.findIndex(o => o.id === data.id)
    if (idx >= 0) state.orders[idx] = { ...state.orders[idx], ...data }
  } else {
    const newId = 'O' + Date.now().toString().slice(-10)
    const cat = state.serviceCategories.find(c => c.id === data.categoryId)
    const customer = state.customers.find(c => c.id === data.customerId)
    const catInfo = state.customerCategories.find(c => c.id === customer?.categoryId)
    const estimatedAmount = cat ? +(cat.price * (cat.unit === '元/小时' ? data.duration : 1) * (catInfo?.discount || 1)).toFixed(1) : 0
    state.orders.unshift({
      ...data, id: newId, status: 0, estimatedAmount, actualAmount: null,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    })
    // 更新服务员状态
    if (data.workerId) {
      const w = state.workers.find(w => w.id === data.workerId)
      if (w) w.status = 1
    }
  }
  return true
}
export async function updateOrderStatus(id, status) {
  await delay()
  const idx = state.orders.findIndex(o => o.id === id)
  if (idx < 0) return false
  state.orders[idx].status = status
  // 完成时计算实际金额
  if (status === 3) {
    const o = state.orders[idx]
    const customer = state.customers.find(c => c.id === o.customerId)
    const catInfo = state.customerCategories.find(c => c.id === customer?.categoryId)
    state.orders[idx].actualAmount = o.estimatedAmount
    // 更新累计消费和订单数
    if (customer) {
      customer.orderCount += 1
      customer.totalConsume = +(customer.totalConsume + o.estimatedAmount).toFixed(1)
    }
    // 服务员改回空闲
    if (o.workerId) {
      const w = state.workers.find(w => w.id === o.workerId)
      if (w) w.status = 0
    }
  }
  // 派单
  if (status === 1) {
    const o = state.orders[idx]
    if (o.workerId) {
      const w = state.workers.find(w => w.id === o.workerId)
      if (w) w.status = 1
    }
  }
  // 取消
  if (status === 4) {
    const o = state.orders[idx]
    if (o.workerId) {
      const w = state.workers.find(w => w.id === o.workerId)
      if (w) w.status = 0
    }
  }
  return true
}
export async function deleteOrder(id) {
  await delay()
  state.orders = state.orders.filter(o => o.id !== id)
  return true
}

// ===== 评价与投诉 =====
export async function getReviews(params = {}) {
  await delay()
  const enriched = state.reviews.map(r => {
    const o = state.orders.find(o => o.id === r.orderId)
    const c = state.customers.find(c => c.id === o?.customerId)
    const w = state.workers.find(w => w.id === o?.workerId)
    return {
      ...r,
      orderIdShort: r.orderId,
      customerName: c?.name || '-',
      workerName: w?.name || '-',
      orderCategoryId: o?.categoryId
    }
  })
  if (params.keyword) {
    const kw = params.keyword.trim()
    return { total: enriched.length, list: enriched.filter(r => r.customerName.includes(kw) || r.content.includes(kw)) }
  }
  return { total: enriched.length, list: enriched }
}
export async function saveReview(data) {
  await delay()
  if (data.id) {
    const idx = state.reviews.findIndex(r => r.id === data.id)
    if (idx >= 0) state.reviews[idx] = { ...state.reviews[idx], ...data }
  } else {
    const newId = Math.max(0, ...state.reviews.map(r => r.id)) + 1
    state.reviews.unshift({ ...data, id: newId, createTime: new Date().toISOString().replace('T', ' ').slice(0, 16) })
    // 更新服务员评分
    const o = state.orders.find(o => o.id === data.orderId)
    if (o?.workerId) {
      const w = state.workers.find(w => w.id === o.workerId)
      const wReviews = state.reviews
        .filter(r => {
          const ord = state.orders.find(x => x.id === r.orderId)
          return ord?.workerId === o.workerId
        })
      if (wReviews.length > 0) {
        const avg = wReviews.reduce((s, r) => s + r.stars, 0) / wReviews.length
        w.rating = +avg.toFixed(1)
      }
    }
  }
  return true
}

// ===== 字典 =====
export async function getDict(type) {
  await delay()
  switch (type) {
    case 'customerCategory': return state.customerCategories
    case 'serviceCategory': return state.serviceCategories
    case 'roles': return state.roles
    default: return []
  }
}

// ===== 仪表盘 =====
export async function getDashboard() {
  await delay()
  const totalOrders = state.orders.length
  const pendingOrders = state.orders.filter(o => o.status === 0 || o.status === 1 || o.status === 2).length
  const completedOrders = state.orders.filter(o => o.status === 3).length
  const totalCustomers = state.customers.length
  const totalWorkers = state.workers.length
  const idleWorkers = state.workers.filter(w => w.status === 0).length
  const totalRevenue = +state.orders.filter(o => o.actualAmount).reduce((s, o) => s + o.actualAmount, 0).toFixed(1)

  // 近7天订单模拟
  const weekData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = state.orders.filter(o => o.createTime?.startsWith(dateStr.replace(/-/g, '-'))).length || Math.floor(Math.random() * 5 + 1)
    weekData.push({ date: dateStr.slice(5), count })
  }

  // 订单状态分布
  const statusDist = [0, 1, 2, 3, 4].map(s => ({
    status: s,
    count: state.orders.filter(o => o.status === s).length
  }))

  return {
    totalOrders, pendingOrders, completedOrders,
    totalCustomers, totalWorkers, idleWorkers,
    totalRevenue, weekData, statusDist
  }
}
