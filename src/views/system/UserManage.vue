<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><User /></el-icon>用户权限管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增用户</el-button>
    </div>

    <el-table :data="list" stripe border>
      <el-table-column prop="id" label="#" width="60" />
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column label="角色" width="140">
        <template #default="{ row }">
          <el-tag :type="row.roleId === 1 ? 'warning' : ''" effect="dark">{{ roles.find(r => r.id === row.roleId)?.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="140" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Edit" @click="openDialog(row)">编辑</el-button>
          <el-button link type="warning" size="small" :icon="Lock" @click="resetPwd(row)">重置密码</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
            <template #reference><el-button link type="danger" size="small" :icon="Delete">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="460px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" style="width:100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item v-if="!form.id" label="初始密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Lock } from '@element-plus/icons-vue'
import { sysUsers, roles } from '@/mock/data.js'

const list = ref([])
const dialogVisible = ref(false)
const form = reactive({ id: null, username: '', name: '', roleId: 2, phone: '', password: '123456' })
const formRef = ref(null)
const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  name: [{ required: true, message: '请输入姓名' }],
  roleId: [{ required: true, message: '请选择角色' }],
  password: [{ required: true, message: '请输入密码' }]
}

function load() { list.value = JSON.parse(JSON.stringify(sysUsers)) }

function openDialog(row) {
  Object.assign(form, row ? { ...row, password: '' } : { id: null, username: '', name: '', roleId: 2, phone: '', password: '123456' })
  dialogVisible.value = true
}

function handleSave() {
  formRef.value.validate().then(() => {
    ElMessage.success('保存成功（Mock）')
    dialogVisible.value = false
  }).catch(() => {})
}

function resetPwd(row) {
  ElMessage.success('密码已重置为 123456（Mock）')
}

function handleDelete(row) {
  const idx = sysUsers.findIndex(u => u.id === row.id)
  if (idx >= 0) sysUsers.splice(idx, 1)
  load()
  ElMessage.success('删除成功')
}

onMounted(load)
</script>
