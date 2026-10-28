<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><User /></el-icon>客户信息管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增客户</el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="search.keyword" placeholder="客户编号/姓名/电话" clearable style="width:240px" :prefix-icon="Search" @keyup.enter="loadData" @clear="loadData" />
      <el-select v-model="search.categoryId" placeholder="客户类别" clearable style="width:160px" @change="loadData">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
      <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="list" stripe style="width:100%" border>
      <el-table-column type="index" label="#" width="55" />
      <el-table-column prop="id" label="客户编号" width="130" />
      <el-table-column prop="name" label="姓名" width="90" />
      <el-table-column prop="gender" label="性别" width="60" align="center" />
      <el-table-column label="客户类别" width="110">
        <template #default="{ row }">
          <el-tag :type="row.categoryId === 3 ? 'warning' : row.categoryId === 2 ? '' : 'info'" effect="light">
            {{ getCategoryName(row.categoryId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column prop="address" label="家庭住址" show-overflow-tooltip />
      <el-table-column prop="registerDate" label="登记日期" width="110" />
      <el-table-column prop="orderCount" label="历史订单" width="90" align="center" />
      <el-table-column prop="totalConsume" label="累计消费" width="100" align="right">
        <template #default="{ row }">¥{{ row.totalConsume?.toFixed(1) || 0 }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除该客户吗？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button link type="danger" size="small" :icon="Delete">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
        :total="total" @size-change="loadData" @current-change="loadData" />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑客户' : '新增客户'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="name"><el-input v-model="form.name" placeholder="请输入姓名" /></el-form-item>
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
            <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" placeholder="请输入手机号" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类别" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择类别" style="width:100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name + ' (折扣 ' + (c.discount*10) + '折)'" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="家庭住址" prop="address"><el-input v-model="form.address" placeholder="请输入详细地址" /></el-form-item>
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
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { getCustomers, saveCustomer, deleteCustomer, getDict } from '@/mock/api.js'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = reactive({ keyword: '', categoryId: '' })
const categories = ref([])

const dialogVisible = ref(false)
const saving = ref(false)
const form = reactive({ id: null, name: '', gender: '女', phone: '', categoryId: 1, address: '' })
const formRef = ref(null)
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择客户类别', trigger: 'change' }],
  address: [{ required: true, message: '请输入家庭住址', trigger: 'blur' }]
}

function getCategoryName(id) {
  return categories.value.find(c => c.id === id)?.name || '-'
}

async function loadData() {
  const res = await getCustomers(search)
  list.value = res.list
  total.value = res.total
}

function resetSearch() {
  search.keyword = ''
  search.categoryId = ''
  loadData()
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, name: '', gender: '女', phone: '', categoryId: 1, address: '' })
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate().catch(() => {})
  saving.value = true
  try {
    await saveCustomer(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  try {
    await deleteCustomer(id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(async () => {
  categories.value = await getDict('customerCategory')
  loadData()
})
</script>

<style scoped lang="scss">
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
