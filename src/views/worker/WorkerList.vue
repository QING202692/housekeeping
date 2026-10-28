<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><Avatar /></el-icon>服务员信息管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增服务员</el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="search.keyword" placeholder="编号/姓名/电话" clearable style="width:220px" :prefix-icon="Search" @keyup.enter="loadData" @clear="loadData" />
      <el-select v-model="search.serviceCategoryId" placeholder="服务类别" clearable style="width:150px" @change="loadData">
        <el-option v-for="c in serviceCats" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="search.status" placeholder="当前状态" clearable style="width:130px" @change="loadData">
        <el-option v-for="(v, k) in workerStatusMap" :key="k" :label="v.label" :value="Number(k)" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
      <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="list" stripe border style="width:100%">
      <el-table-column type="index" label="#" width="55" />
      <el-table-column prop="id" label="服务员编号" width="130" />
      <el-table-column label="基本信息" width="160">
        <template #default="{ row }">
          <div style="display:flex;align-items:center;gap:10px">
            <el-avatar :size="40" :style="{background:'#66BB6A'}">{{ row.name?.charAt(0) }}</el-avatar>
            <div>
              <div style="font-weight:600">{{ row.name }}</div>
              <div style="font-size:12px;color:#999">{{ row.gender }} · {{ row.phone }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="服务类别" width="120">
        <template #default="{ row }">
          <el-tag effect="light">{{ getServiceCat(row.serviceCategoryId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="certLevel" label="资格等级" width="100" align="center" />
      <el-table-column prop="healthCertNo" label="健康证编号" width="160" />
      <el-table-column label="综合评分" width="120">
        <template #default="{ row }">
          <el-rate :model-value="row.rating" disabled show-score text-color="#2E7D32" score-template="{value}分" />
        </template>
      </el-table-column>
      <el-table-column label="当前状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="workerStatusMap[row.status]?.color" effect="dark">
            {{ workerStatusMap[row.status]?.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="registerDate" label="登记日期" width="110" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
          <el-button link type="success" size="small" :icon="Clock" @click="changeStatus(row)">排班</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger" size="small" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
        :total="total" @size-change="loadData" @current-change="loadData" />
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑服务员' : '新增服务员'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务类别" prop="serviceCategoryId">
              <el-select v-model="form.serviceCategoryId" style="width:100%">
                <el-option v-for="c in serviceCats" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健康证编号" prop="healthCertNo"><el-input v-model="form.healthCertNo" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资格等级" prop="certLevel">
              <el-select v-model="form.certLevel" style="width:100%">
                <el-option label="初级" value="初级" />
                <el-option label="中级" value="中级" />
                <el-option label="高级" value="高级" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Clock } from '@element-plus/icons-vue'
import { getWorkers, saveWorker, deleteWorker, getDict } from '@/mock/api.js'
import { workerStatusMap } from '@/mock/data.js'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = reactive({ keyword: '', serviceCategoryId: '', status: '' })
const serviceCats = ref([])

const dialogVisible = ref(false)
const saving = ref(false)
const form = reactive({ id: null, name: '', gender: '女', phone: '', serviceCategoryId: 1, healthCertNo: '', certLevel: '中级' })
const formRef = ref(null)
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  serviceCategoryId: [{ required: true, message: '请选择服务类别', trigger: 'change' }],
  healthCertNo: [{ required: true, message: '请输入健康证编号', trigger: 'blur' }],
  certLevel: [{ required: true, message: '请选择资格等级', trigger: 'change' }]
}

function getServiceCat(id) { return serviceCats.value.find(c => c.id === id)?.name || '-' }

async function loadData() {
  const res = await getWorkers(search)
  list.value = res.list
  total.value = res.total
}
function resetSearch() {
  search.keyword = ''; search.serviceCategoryId = ''; search.status = ''
  loadData()
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, name: '', gender: '女', phone: '', serviceCategoryId: 1, healthCertNo: '', certLevel: '中级' })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate().catch(() => {})
  saving.value = true
  try {
    await saveWorker(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.message)
  } finally { saving.value = false }
}

async function handleDelete(id) {
  try {
    await deleteWorker(id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

async function changeStatus(row) {
  const { value } = await ElMessageBox.prompt('请选择新状态', '更新档期', {
    inputType: 'select',
    inputOptions: [
      { value: 0, label: '空闲' },
      { value: 1, label: '已排班' },
      { value: 2, label: '服务中' },
      { value: 3, label: '休假' }
    ],
    inputValue: row.status,
    confirmButtonText: '确定'
  }).catch(() => ({}))
  if (value !== undefined) {
    row.status = value
    await saveWorker(row)
    ElMessage.success('状态已更新')
  }
}

onMounted(async () => {
  serviceCats.value = await getDict('serviceCategory')
  loadData()
})
</script>

<style scoped lang="scss">
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
