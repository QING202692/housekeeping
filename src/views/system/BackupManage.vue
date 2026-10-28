<template>
  <div class="page-container">
    <div class="page-header">
      <h2><el-icon style="margin-right:8px"><FolderOpened /></el-icon>数据备份与恢复</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="backup-card">
          <div class="backup-title">
            <el-icon :size="36" color="#4CAF50"><UploadFilled /></el-icon>
            <h3>立即备份</h3>
            <p>将当前系统数据导出为备份文件</p>
          </div>
          <el-button type="primary" size="large" :icon="Download" @click="doBackup">执行备份</el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="backup-card">
          <div class="backup-title">
            <el-icon :size="36" color="#FF9800"><RefreshRight /></el-icon>
            <h3>数据恢复</h3>
            <p>从备份文件恢复系统数据</p>
          </div>
          <el-upload :auto-upload="false" :show-file-list="false" :before-upload="doRestore">
            <el-button type="warning" size="large" :icon="Upload">选择备份文件恢复</el-button>
          </el-upload>
        </div>
      </el-col>
    </el-row>

    <el-divider />

    <h3 style="color:#2E7D32;margin-bottom:16px">备份历史</h3>
    <el-table :data="backupList" stripe border>
      <el-table-column prop="id" label="备份编号" width="180" />
      <el-table-column prop="time" label="备份时间" width="200" />
      <el-table-column prop="size" label="文件大小" width="120" />
      <el-table-column prop="operator" label="操作员" width="120" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" size="small" :icon="Download" @click="ElMessage.success('下载中（Mock）')">下载</el-button>
          <el-button link type="success" size="small" :icon="RefreshRight" @click="doRestoreFromHistory(row)">恢复</el-button>
          <el-popconfirm title="删除该备份？" @confirm="removeBackup(row)">
            <template #reference><el-button link type="danger" size="small" :icon="Delete">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Download, RefreshRight, Upload, Delete } from '@element-plus/icons-vue'

const backupList = ref([
  { id: 'backup_20241028_0900', time: '2024-10-28 09:00:00', size: '2.3 MB', operator: 'admin', remark: '每日自动备份' },
  { id: 'backup_20241027_0900', time: '2024-10-27 09:00:00', size: '2.1 MB', operator: 'admin', remark: '每日自动备份' },
  { id: 'backup_20241026_1530', time: '2024-10-26 15:30:00', size: '2.0 MB', operator: 'admin', remark: '手动备份' }
])

function doBackup() {
  const id = 'backup_' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  backupList.value.unshift({
    id, time: new Date().toLocaleString(), size: '2.4 MB', operator: 'admin', remark: '手动备份'
  })
  ElMessage.success('备份成功！')
}

async function doRestore(file) {
  try {
    await ElMessageBox.confirm('恢复将覆盖当前数据，确认继续？', '恢复确认', { type: 'warning' })
    ElMessage.success('数据恢复成功（Mock）')
  } catch {}
}

async function doRestoreFromHistory(row) {
  try {
    await ElMessageBox.confirm(`确定从备份 ${row.id} 恢复？`, '恢复确认', { type: 'warning' })
    ElMessage.success('数据恢复成功（Mock）')
  } catch {}
}

function removeBackup(row) {
  backupList.value = backupList.value.filter(b => b.id !== row.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped lang="scss">
.backup-card {
  background: #fff;
  border: 1px solid #E8F5E9;
  border-radius: 12px;
  padding: 36px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    border-color: #4CAF50;
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.12);
  }

  .backup-title {
    margin-bottom: 24px;
    h3 { margin: 12px 0 6px; color: #333; }
    p { margin: 0; color: #999; font-size: 13px; }
  }
}
</style>
