<template>
  <div class="page-container">
    <el-tabs v-model="tab" type="border-card">
      <!-- 客户类别 -->
      <el-tab-pane label="客户类别设置" name="customer">
        <div class="page-header" style="margin-top:16px">
          <h2 style="font-size:16px">客户类别及折扣</h2>
          <el-button type="primary" :icon="Plus" @click="openCatDialog('customer')">新增类别</el-button>
        </div>
        <el-table :data="customerCategories" stripe border>
          <el-table-column prop="id" label="#" width="60" />
          <el-table-column prop="name" label="类别名称" width="160" />
          <el-table-column label="折扣" width="140">
            <template #default="{ row }">
              <span style="color:#4CAF50;font-weight:600">{{ (row.discount * 10).toFixed(1) }} 折</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" size="small" @click="openCatDialog('customer', row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="handleDelete('customer', row)">
                <template #reference><el-button link type="danger" :icon="Delete" size="small">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 服务类别 -->
      <el-tab-pane label="服务类别与价格" name="service">
        <div class="page-header" style="margin-top:16px">
          <h2 style="font-size:16px">服务类别与价格标准</h2>
          <el-button type="primary" :icon="Plus" @click="openCatDialog('service')">新增类别</el-button>
        </div>
        <el-table :data="serviceCategories" stripe border>
          <el-table-column prop="id" label="#" width="60" />
          <el-table-column prop="name" label="服务类别" width="160" />
          <el-table-column prop="price" label="单价" width="120" align="right">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="unit" label="计价单位" width="120" />
          <el-table-column prop="description" label="说明" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" size="small" @click="openCatDialog('service', row)">编辑</el-button>
              <el-popconfirm title="确定删除？" @confirm="handleDelete('service', row)">
                <template #reference><el-button link type="danger" :icon="Delete" size="small">删除</el-button></template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 违约金 -->
      <el-tab-pane label="违约金标准" name="penalty">
        <div class="penalty-box">
          <el-form label-width="160px" style="max-width:500px;margin-top:16px">
            <el-form-item label="违约金倍数">
              <el-input-number v-model="penalty.multiple" :min="1" :max="10" />
              <span style="margin-left:10px;color:#999">倍（按订单金额的 N 倍收取违约金）</span>
            </el-form-item>
            <el-form-item label="提前取消期限">
              <el-input-number v-model="penalty.earlyHours" :min="1" :max="72" />
              <span style="margin-left:10px;color:#999">小时（提前取消订单免违约金）</span>
            </el-form-item>
            <el-form-item label="最晚取消期限">
              <el-input-number v-model="penalty.lateHours" :min="0" :max="24" />
              <span style="margin-left:10px;color:#999">小时（距上门时间不足 N 小时取消按违约金收取）</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePenalty">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="catDialog.visible" :title="catDialog.type === 'customer' ? '客户类别' : '服务类别'" width="460px" destroy-on-close>
      <el-form :model="catDialog.form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="catDialog.form.name" /></el-form-item>
        <el-form-item v-if="catDialog.type === 'customer'" label="折扣（0.1-1.0）">
          <el-input-number v-model="catDialog.form.discount" :min="0.1" :max="1" :step="0.1" :precision="1" />
        </el-form-item>
        <el-form-item v-if="catDialog.type === 'service'" label="单价">
          <el-input-number v-model="catDialog.form.price" :min="0" :precision="1" />
        </el-form-item>
        <el-form-item v-if="catDialog.type === 'service'" label="计价单位">
          <el-select v-model="catDialog.form.unit" style="width:100%">
            <el-option label="元/小时" value="元/小时" />
            <el-option label="元/次" value="元/次" />
            <el-option label="元/月" value="元/月" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明"><el-input v-model="catDialog.form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveCat">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { customerCategories, serviceCategories } from '@/mock/data.js'

const tab = ref('customer')
const penalty = reactive({ multiple: 2, earlyHours: 24, lateHours: 4 })
const catDialog = reactive({ visible: false, type: 'customer', form: {} })

function openCatDialog(type, row) {
  catDialog.type = type
  catDialog.form = row ? { ...row } : (type === 'customer' ? { name: '', discount: 1.0, description: '' } : { name: '', price: 0, unit: '元/小时', description: '' })
  catDialog.visible = true
}
function saveCat() {
  ElMessage.success('保存成功（Mock）')
  catDialog.visible = false
}
function handleDelete(type, row) {
  const list = type === 'customer' ? customerCategories : serviceCategories
  const idx = list.findIndex(x => x.id === row.id)
  if (idx >= 0) list.splice(idx, 1)
  ElMessage.success('删除成功')
}
function savePenalty() {
  ElMessage.success('违约金设置已保存（Mock）')
}
</script>

<style scoped>
.penalty-box { padding: 0 16px; }
</style>
