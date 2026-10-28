<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><Tickets /></el-icon>订单（预约）管理</h2>
      <div>
        <el-button type="primary" :icon="Plus" @click="openDialog()">新建预约</el-button>
      </div>
    </div>

    <div class="search-bar">
      <el-input v-model="search.keyword" placeholder="订单号/客户/服务员" clearable style="width:220px" :prefix-icon="Search" @keyup.enter="loadData" @clear="loadData" />
      <el-select v-model="search.categoryId" placeholder="服务类别" clearable style="width:140px" @change="loadData">
        <el-option v-for="c in serviceCats" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="search.status" placeholder="订单状态" clearable style="width:130px" @change="loadData">
        <el-option v-for="(v, k) in orderStatusMap" :key="k" :label="v.label" :value="Number(k)" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
      <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="list" stripe border style="width:100%">
      <el-table-column prop="id" label="订单编号" width="150" />
      <el-table-column label="客户" width="130">
        <template #default="{ row }">
          <div style="font-weight:600">{{ row.customerName }}</div>
          <div style="font-size:12px;color:#999">{{ row.customerId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="服务类别" width="120">
        <template #default="{ row }"><el-tag effect="light">{{ row.categoryName }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="appointDate" label="预约日期" width="110" />
      <el-table-column prop="expectTime" label="上门时间" width="90" />
      <el-table-column label="服务时长" width="100" align="center">
        <template #default="{ row }">{{ row.duration }} 小时</template>
      </el-table-column>
      <el-table-column label="服务员" width="130">
        <template #default="{ row }">{{ row.workerName }}</template>
      </el-table-column>
      <el-table-column label="预估金额" width="110" align="right">
        <template #default="{ row }"><span style="color:#4CAF50;font-weight:600">¥{{ row.estimatedAmount }}</span></template>
      </el-table-column>
      <el-table-column label="实际金额" width="110" align="right">
        <template #default="{ row }">{{ row.actualAmount != null ? '¥' + row.actualAmount : '-' }}</template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="orderStatusMap[row.status]?.color" effect="dark" size="small">
            {{ orderStatusMap[row.status]?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0" link type="primary" size="small" :icon="Promotion" @click="quickAction(row, 1)">派单</el-button>
          <el-button v-if="row.status === 1" link type="primary" size="small" :icon="VideoPlay" @click="quickAction(row, 2)">开始服务</el-button>
          <el-button v-if="row.status === 2" link type="success" size="small" :icon="Select" @click="quickAction(row, 3)">完工结算</el-button>
          <el-button v-if="row.status === 0 || row.status === 1" link type="warning" size="small" :icon="Close" @click="quickAction(row, 4)">取消</el-button>
          <el-button link size="small" :icon="View" @click="viewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
        :total="total" @size-change="loadData" @current-change="loadData" />
    </div>

    <!-- 新建预约对话框 -->
    <el-dialog v-model="dialogVisible" title="新建预约登记" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-divider content-position="left">客户信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户编号" prop="customerId">
              <el-select v-model="form.customerId" filterable placeholder="搜索客户编号/姓名" style="width:100%" @change="onCustomerChange">
                <el-option v-for="c in allCustomers" :key="c.id" :label="c.id + ' - ' + c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类别">
              <el-tag v-if="customerInfo" effect="dark" :type="customerInfo.categoryId === 3 ? 'warning' : customerInfo.categoryId === 2 ? '' : 'info'">
                {{ getCategoryName(customerInfo.categoryId) }}（折扣 {{ getCategoryDiscount(customerInfo.categoryId) }}）
              </el-tag>
              <span v-else style="color:#999;font-size:12px">请选择客户</span>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="customerInfo">
            <div class="customer-info-card">
              <span><b>姓名：</b>{{ customerInfo.name }}</span>
              <span><b>电话：</b>{{ customerInfo.phone }}</span>
              <span><b>历史订单：</b>{{ customerInfo.orderCount }}</span>
              <span><b>累计消费：</b>¥{{ customerInfo.totalConsume }}</span>
            </div>
          </el-col>
        </el-row>

        <el-divider content-position="left">预约需求</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="服务类别" prop="categoryId">
              <el-select v-model="form.categoryId" style="width:100%" @change="onCategoryChange">
                <el-option v-for="c in serviceCats" :key="c.id" :label="c.name + ' (' + c.price + c.unit + ')'" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约日期" prop="appointDate">
              <el-date-picker v-model="form.appointDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望上门时间" prop="expectTime">
              <el-time-picker v-model="form.expectTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务时长" prop="duration">
              <el-input-number v-model="form.duration" :min="1" :max="12" :controls="false" style="width:100%" />
              <span style="margin-left:8px;color:#999">小时</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="服务地址" prop="address">
              <el-input v-model="form.address" placeholder="默认取客户家庭住址" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 智能推荐 -->
        <el-divider content-position="left">
          智能推荐服务员
          <el-button type="primary" link style="margin-left:12px" :icon="Refresh" :loading="recommending" @click="loadRecommend">刷新推荐</el-button>
        </el-divider>
        <div v-if="form.categoryId && recommends.length" class="recommend-list">
          <el-radio-group v-model="form.workerId">
            <div v-for="w in recommends" :key="w.id" class="recommend-card">
              <el-radio :value="w.id">
                <div class="rec-content">
                  <div class="rec-avatar" :style="{background:getRatingColor(w.rating)}">{{ w.name?.charAt(0) }}</div>
                  <div class="rec-info">
                    <div class="rec-name">{{ w.name }}（{{ w.gender }}）<el-tag size="small" effect="plain">{{ w.certLevel }}</el-tag></div>
                    <div class="rec-rating">
                      <el-rate :model-value="w.rating" disabled size="small" show-score text-color="#2E7D32" score-template="{value}分" />
                    </div>
                  </div>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>
        <div v-else-if="form.categoryId" style="color:#999;font-size:12px;padding:8px 0">暂无空闲的该类别服务员，可直接派单或稍后安排</div>

        <!-- 金额预估 -->
        <div v-if="estimatedAmount > 0" class="amount-box">
          <div class="amount-row">
            <span>服务单价：</span><span>¥{{ currentCat?.price }} / {{ currentCat?.unit }}</span>
          </div>
          <div class="amount-row" v-if="currentCat?.unit === '元/小时'">
            <span>服务时长：</span><span>{{ form.duration }} 小时</span>
          </div>
          <div class="amount-row" v-if="customerInfo">
            <span>客户折扣：</span><span>{{ getCategoryDiscount(customerInfo.categoryId) }}</span>
          </div>
          <div class="amount-row total">
            <span>预估金额：</span><span class="amount">¥{{ estimatedAmount.toFixed(1) }}</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">提交预约</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="520px">
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="订单编号">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentDetail.customerName }}（{{ currentDetail.customerId }}）</el-descriptions-item>
        <el-descriptions-item label="服务类别">{{ currentDetail.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ currentDetail.appointDate }} {{ currentDetail.expectTime }}</el-descriptions-item>
        <el-descriptions-item label="服务地址">{{ currentDetail.address }}</el-descriptions-item>
        <el-descriptions-item label="服务时长">{{ currentDetail.duration }} 小时</el-descriptions-item>
        <el-descriptions-item label="服务员">{{ currentDetail.workerName }}</el-descriptions-item>
        <el-descriptions-item label="预估金额">¥{{ currentDetail.estimatedAmount }}</el-descriptions-item>
        <el-descriptions-item label="实际金额">{{ currentDetail.actualAmount != null ? '¥' + currentDetail.actualAmount : '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="orderStatusMap[currentDetail.status]?.color">{{ orderStatusMap[currentDetail.status]?.label }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Promotion, VideoPlay, Select, Close, View } from '@element-plus/icons-vue'
import { getOrders, saveOrder, updateOrderStatus, recommendWorkers, getDict, getCustomers } from '@/mock/api.js'
import { orderStatusMap, customerCategories, serviceCategories } from '@/mock/data.js'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = reactive({ keyword: '', categoryId: '', status: '' })
const serviceCats = ref([])
const allCustomers = ref([])

const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentDetail = ref(null)
const saving = ref(false)
const recommending = ref(false)
const recommends = ref([])
const formRef = ref(null)
const form = reactive({ id: null, customerId: '', categoryId: null, appointDate: '', expectTime: '', address: '', duration: 2, workerId: null })
const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择服务类别', trigger: 'change' }],
  appointDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  expectTime: [{ required: true, message: '请选择上门时间', trigger: 'change' }],
  address: [{ required: true, message: '请输入服务地址', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入服务时长', trigger: 'blur' }]
}

const customerInfo = computed(() => allCustomers.value.find(c => c.id === form.customerId))
const currentCat = computed(() => serviceCats.value.find(c => c.id === form.categoryId))
const estimatedAmount = computed(() => {
  if (!currentCat.value || !customerInfo.value) return 0
  const base = currentCat.value.unit === '元/小时' ? currentCat.value.price * form.duration : currentCat.value.price
  const discount = customerCategories.find(c => c.id === customerInfo.value.categoryId)?.discount || 1
  return +(base * discount).toFixed(1)
})

function getCategoryName(id) { return customerCategories.find(c => c.id === id)?.name || '-' }
function getCategoryDiscount(id) {
  const d = customerCategories.find(c => c.id === id)?.discount || 1
  return Math.round(d * 10) + ' 折'
}
function getRatingColor(r) {
  if (r >= 4.8) return '#FFA726'
  if (r >= 4.5) return '#66BB6A'
  if (r >= 4.0) return '#4CAF50'
  return '#9CCC65'
}

async function loadData() {
  const res = await getOrders(search)
  list.value = res.list
  total.value = res.total
}
function resetSearch() { search.keyword = ''; search.categoryId = ''; search.status = ''; loadData() }

async function openDialog() {
  Object.assign(form, { id: null, customerId: '', categoryId: null, appointDate: '', expectTime: '', address: '', duration: 2, workerId: null })
  recommends.value = []
  dialogVisible.value = true
}

async function onCustomerChange() {
  if (customerInfo.value) form.address = customerInfo.value.address
  if (form.categoryId) loadRecommend()
}
async function onCategoryChange() {
  if (form.categoryId) loadRecommend()
}
async function loadRecommend() {
  if (!form.categoryId) return
  recommending.value = true
  recommends.value = await recommendWorkers({ serviceCategoryId: form.categoryId, expectDate: form.appointDate })
  recommending.value = false
}

async function handleSave() {
  await formRef.value.validate().catch(() => {})
  if (!form.workerId) {
    try {
      await ElMessageBox.confirm('未选择服务员，是否保存为"待派单"状态？', '提示')
    } catch { return }
  }
  saving.value = true
  try {
    await saveOrder(form)
    ElMessage.success('预约登记成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.message)
  } finally { saving.value = false }
}

async function quickAction(row, status) {
  const actions = { 1: '确认派单', 2: '开始服务', 3: '完工结算', 4: '取消订单' }
  try {
    await ElMessageBox.confirm(`确定执行"${actions[status]}"操作？`, '操作确认')
    await updateOrderStatus(row.id, status)
    ElMessage.success('操作成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
  }
}

function viewDetail(row) {
  currentDetail.value = row
  detailVisible.value = true
}

onMounted(async () => {
  serviceCats.value = await getDict('serviceCategory')
  const cusRes = await getCustomers({})
  allCustomers.value = cusRes.list
  loadData()
})
</script>

<style scoped lang="scss">
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.customer-info-card {
  background: #F1F8E9;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #555;
  flex-wrap: wrap;

  span b { color: #2E7D32; margin-right: 4px; }
}
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
}
.recommend-card {
  border: 1px solid #E8F5E9;
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover { border-color: #4CAF50; background: #F1F8E9; }

  .rec-content { display: flex; align-items: center; gap: 12px; }
  .rec-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 16px;
  }
  .rec-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
}
.amount-box {
  background: #FFFDE7;
  border-radius: 8px;
  padding: 14px 18px;
  border: 1px solid #FFF9C4;
  margin-top: 4px;

  .amount-row {
    display: flex; justify-content: space-between;
    font-size: 13px; color: #666;
    margin-bottom: 4px;

    &.total {
      font-size: 16px; font-weight: 600; color: #333;
      border-top: 1px dashed #FFF59D;
      padding-top: 8px; margin-top: 4px;
      .amount { color: #E65100; font-size: 20px; }
    }
  }
}
</style>
