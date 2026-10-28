<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><ChatDotRound /></el-icon>评价与投诉管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">录入评价</el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="search.keyword" placeholder="客户姓名/评价内容" clearable style="width:240px" :prefix-icon="Search" @keyup.enter="loadData" @clear="loadData" />
      <el-select v-model="search.complaint" placeholder="投诉状态" clearable style="width:140px" @change="loadData">
        <el-option label="全部" :value="''" />
        <el-option label="有投诉" :value="1" />
        <el-option label="无投诉" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
    </div>

    <el-table :data="list" stripe border style="width:100%">
      <el-table-column prop="orderIdShort" label="订单编号" width="150" />
      <el-table-column prop="customerName" label="客户" width="100" />
      <el-table-column prop="workerName" label="服务员" width="100" />
      <el-table-column label="星级评价" width="180">
        <template #default="{ row }">
          <el-rate :model-value="row.stars" disabled show-score text-color="#FFA726" score-template="{value}星" />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" show-overflow-tooltip />
      <el-table-column label="投诉" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.hasComplaint" type="danger" effect="dark">有投诉</el-tag>
          <span v-else style="color:#BBB">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评价时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="View" @click="viewDetail(row)">查看</el-button>
          <el-button v-if="row.hasComplaint && !row.complaintResult" link type="warning" size="small" :icon="Edit" @click="handleComplaint(row)">处理投诉</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
        :total="total" @size-change="loadData" @current-change="loadData" />
    </div>

    <!-- 录入评价 -->
    <el-dialog v-model="dialogVisible" title="录入服务评价" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="订单" prop="orderId">
          <el-select v-model="form.orderId" filterable placeholder="选择订单（已完成）" style="width:100%">
            <el-option v-for="o in completedOrders" :key="o.id" :label="o.id + ' - ' + o.customerName + ' - ' + o.categoryName" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="星级评分" prop="stars">
          <el-rate v-model="form.stars" show-text :texts="['很差', '较差', '一般', '满意', '非常满意']" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入客户评价" />
        </el-form-item>
        <el-divider content-position="left">投诉信息（可选）</el-divider>
        <el-form-item label="是否有投诉">
          <el-switch v-model="form.hasComplaint" />
        </el-form-item>
        <el-form-item v-if="form.hasComplaint" label="投诉内容">
          <el-input v-model="form.complaintContent" type="textarea" :rows="2" placeholder="请输入投诉内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情 -->
    <el-dialog v-model="detailVisible" title="评价详情" width="460px">
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="订单编号">{{ currentDetail.orderIdShort }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentDetail.customerName }}</el-descriptions-item>
        <el-descriptions-item label="服务员">{{ currentDetail.workerName }}</el-descriptions-item>
        <el-descriptions-item label="评分">
          <el-rate :model-value="currentDetail.stars" disabled show-score />
        </el-descriptions-item>
        <el-descriptions-item label="评价内容">{{ currentDetail.content }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.hasComplaint" label="投诉内容">{{ currentDetail.complaintContent }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.hasComplaint" label="处理结果">{{ currentDetail.complaintResult || '待处理' }}</el-descriptions-item>
        <el-descriptions-item label="评价时间">{{ currentDetail.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, View } from '@element-plus/icons-vue'
import { getReviews, saveReview, getOrders } from '@/mock/api.js'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = reactive({ keyword: '', complaint: '' })
const completedOrders = ref([])

const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentDetail = ref(null)
const saving = ref(false)
const formRef = ref(null)
const form = reactive({ id: null, orderId: '', stars: 5, content: '', hasComplaint: false, complaintContent: '', complaintResult: '' })
const rules = {
  orderId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  stars: [{ required: true, message: '请选择星级', trigger: 'change' }]
}

async function loadData() {
  const res = await getReviews(search)
  list.value = res.list
  total.value = res.total
}

async function openDialog() {
  const oRes = await getOrders({ status: 3 })
  completedOrders.value = oRes.list
  Object.assign(form, { id: null, orderId: '', stars: 5, content: '', hasComplaint: false, complaintContent: '', complaintResult: '' })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate().catch(() => {})
  saving.value = true
  try {
    await saveReview(form)
    ElMessage.success('评价已录入，服务员评分已自动更新')
    dialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.message) }
  finally { saving.value = false }
}

function viewDetail(row) {
  currentDetail.value = row
  detailVisible.value = true
}

async function handleComplaint(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入投诉处理结果', '处理投诉', {
      inputValue: row.complaintResult || '',
      confirmButtonText: '确认处理'
    })
    row.complaintResult = value
    await saveReview(row)
    ElMessage.success('投诉已处理')
    loadData()
  } catch {}
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
