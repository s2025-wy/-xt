<template>
  <div class="system">
    <div class="page-header">
      <h1>系统管理</h1>
      <p>系统配置和管理功能</p>
    </div>
    
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="用户管理" name="users">
        <div class="tab-content">
          <div class="filter-bar">
            <el-input v-model="userSearch" placeholder="搜索用户名" style="width: 200px" />
            <el-select v-model="userRole" placeholder="角色筛选" style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="普通员工" value="employee" />
              <el-option label="部门主管" value="manager" />
              <el-option label="系统管理员" value="admin" />
            </el-select>
            <el-button type="primary" @click="handleUserSearch">搜索</el-button>
            <el-button type="primary" @click="addUser">添加用户</el-button>
          </div>
          
          <el-table :data="users" border>
            <el-table-column prop="id" label="用户ID" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="department" label="部门" width="100" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <span :class="getRoleClass(row.role)">{{ getRoleLabel(row.role) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.status" @change="toggleUserStatus(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="editUser(row)">编辑</el-button>
                <el-button size="small" @click="resetPassword(row)">重置密码</el-button>
                <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="部门管理" name="departments">
        <div class="tab-content">
          <div class="filter-bar">
            <el-input v-model="deptSearch" placeholder="搜索部门名称" style="width: 200px" />
            <el-button type="primary" @click="handleDeptSearch">搜索</el-button>
            <el-button type="primary" @click="addDepartment">添加部门</el-button>
          </div>
          
          <el-table :data="departments" border>
            <el-table-column prop="id" label="部门ID" width="80" />
            <el-table-column prop="name" label="部门名称" />
            <el-table-column prop="parentName" label="上级部门" width="120" />
            <el-table-column prop="manager" label="部门主管" width="120" />
            <el-table-column prop="memberCount" label="人数" width="80" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="editDepartment(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteDepartment(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="角色权限" name="roles">
        <div class="tab-content">
          <div class="filter-bar">
            <el-button type="primary" @click="addRole">添加角色</el-button>
          </div>
          
          <div class="role-list">
            <el-card v-for="role in roles" :key="role.id" class="role-card">
              <template #header>
                <div class="role-header">
                  <span>{{ role.name }}</span>
                  <div class="role-actions">
                    <el-button size="small" @click="editRole(role)">编辑权限</el-button>
                    <el-button size="small" type="danger" @click="deleteRole(role)">删除</el-button>
                  </div>
                </div>
              </template>
              <div class="role-permissions">
                <div v-for="module in role.permissions" :key="module.name" class="permission-module">
                  <h4>{{ module.name }}</h4>
                  <div class="permission-items">
                    <span v-for="perm in module.items" :key="perm" class="permission-tag">{{ perm }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="系统配置" name="config">
        <div class="tab-content">
          <el-form :model="configForm" label-width="150px">
            <el-form-item label="计划提交截止时间">
              <el-time-picker v-model="configForm.submitDeadline" />
            </el-form-item>
            <el-form-item label="审核时限（工作日）">
              <el-input-number v-model="configForm.reviewDays" :min="1" :max="30" />
            </el-form-item>
            <el-form-item label="超期提醒时间（小时）">
              <el-input-number v-model="configForm.remindHours" :min="1" :max="72" />
            </el-form-item>
            <el-form-item label="通知渠道">
              <el-checkbox-group v-model="configForm.notificationChannels">
                <el-checkbox label="站内消息" />
                <el-checkbox label="邮件" />
                <el-checkbox label="企业微信" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="操作日志" name="logs">
        <div class="tab-content">
          <div class="filter-bar">
            <el-date-picker v-model="logDate" type="date" style="width: 150px" />
            <el-input v-model="logKeyword" placeholder="搜索操作" style="width: 200px" />
            <el-button type="primary" @click="handleLogSearch">搜索</el-button>
          </div>
          
          <el-table :data="logs" border>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="user" label="操作人" width="100" />
            <el-table-column prop="action" label="操作" />
            <el-table-column prop="target" label="操作对象" width="150" />
            <el-table-column prop="time" label="操作时间" width="180" />
            <el-table-column prop="ip" label="IP地址" width="120" />
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const activeTab = ref('users')

const userSearch = ref('')
const userRole = ref('')

const users = ref([
  { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', department: '系统', role: 'admin', status: true },
  { id: 2, username: 'zhangsan', name: '张三', email: 'zhangsan@example.com', department: '产品部', role: 'manager', status: true },
  { id: 3, username: 'lisi', name: '李四', email: 'lisi@example.com', department: '研发部', role: 'employee', status: true },
  { id: 4, username: 'wangwu', name: '王五', email: 'wangwu@example.com', department: '研发部', role: 'employee', status: false },
  { id: 5, username: 'zhaoliu', name: '赵六', email: 'zhaoliu@example.com', department: '市场部', role: 'employee', status: true }
])

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = { employee: '普通员工', manager: '部门主管', admin: '系统管理员' }
  return labels[role] || role
}

const getRoleClass = (role: string) => `role-${role}`

const handleUserSearch = () => {
  console.log('搜索用户:', userSearch.value, userRole.value)
}

const addUser = () => {
  alert('添加用户功能')
}

const editUser = (user: any) => {
  console.log('编辑用户:', user)
}

const resetPassword = (user: any) => {
  if (confirm(`确定重置用户 "${user.username}" 的密码吗？`)) {
    alert('密码已重置为默认密码')
  }
}

const deleteUser = (user: any) => {
  if (confirm(`确定删除用户 "${user.username}" 吗？`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}

const toggleUserStatus = (user: any) => {
  console.log('切换状态:', user)
}

const deptSearch = ref('')

const departments = ref([
  { id: 1, name: '研发部', parentName: '-', manager: '李四', memberCount: 25 },
  { id: 2, name: '产品部', parentName: '-', manager: '张三', memberCount: 15 },
  { id: 3, name: '市场部', parentName: '-', manager: '赵六', memberCount: 20 },
  { id: 4, name: '前端组', parentName: '研发部', manager: '-', memberCount: 10 },
  { id: 5, name: '后端组', parentName: '研发部', manager: '-', memberCount: 15 }
])

const handleDeptSearch = () => {
  console.log('搜索部门:', deptSearch.value)
}

const addDepartment = () => {
  alert('添加部门功能')
}

const editDepartment = (dept: any) => {
  console.log('编辑部门:', dept)
}

const deleteDepartment = (dept: any) => {
  if (confirm(`确定删除部门 "${dept.name}" 吗？`)) {
    departments.value = departments.value.filter(d => d.id !== dept.id)
  }
}

const roles = ref([
  { 
    id: 1, 
    name: '系统管理员',
    permissions: [
      { name: '用户管理', items: ['查看', '添加', '编辑', '删除', '重置密码'] },
      { name: '部门管理', items: ['查看', '添加', '编辑', '删除'] },
      { name: '计划管理', items: ['查看', '审核', '删除'] },
      { name: '考核管理', items: ['查看', '评分', '导出'] },
      { name: '系统配置', items: ['查看', '修改'] }
    ]
  },
  { 
    id: 2, 
    name: '部门主管',
    permissions: [
      { name: '计划管理', items: ['查看', '审核', '催办'] },
      { name: '考核管理', items: ['查看', '评分'] },
      { name: '执行跟踪', items: ['查看', '标记风险'] }
    ]
  },
  { 
    id: 3, 
    name: '普通员工',
    permissions: [
      { name: '计划管理', items: ['创建', '查看', '编辑', '提交'] },
      { name: '执行跟踪', items: ['更新进度', '延期申请'] },
      { name: '考核管理', items: ['查看', '申诉'] }
    ]
  }
])

const addRole = () => {
  alert('添加角色功能')
}

const editRole = (role: any) => {
  console.log('编辑角色:', role)
}

const deleteRole = (role: any) => {
  if (confirm(`确定删除角色 "${role.name}" 吗？`)) {
    roles.value = roles.value.filter(r => r.id !== role.id)
  }
}

const configForm = reactive({
  submitDeadline: '17:00',
  reviewDays: 2,
  remindHours: 2,
  notificationChannels: ['站内消息', '邮件']
})

const saveConfig = () => {
  alert('配置保存成功')
}

const logDate = ref('')
const logKeyword = ref('')

const logs = ref([
  { id: 1, user: 'admin', action: '登录系统', target: '-', time: '2026-07-01 09:00:00', ip: '192.168.1.100' },
  { id: 2, user: 'admin', action: '审核计划', target: 'Q3产品需求文档', time: '2026-07-01 09:30:00', ip: '192.168.1.100' },
  { id: 3, user: 'zhangsan', action: '提交计划', target: 'Q3产品需求文档', time: '2026-07-01 10:00:00', ip: '192.168.1.101' },
  { id: 4, user: 'admin', action: '添加用户', target: 'newuser', time: '2026-07-01 11:00:00', ip: '192.168.1.100' },
  { id: 5, user: 'lisi', action: '更新进度', target: '代码审查会议', time: '2026-07-01 14:30:00', ip: '192.168.1.102' }
])

const handleLogSearch = () => {
  console.log('搜索日志:', logDate.value, logKeyword.value)
}
</script>

<style scoped>
.system {
  padding-bottom: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.page-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.tab-content {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.role-employee {
  background: #f6ffed;
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-manager {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-admin {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.role-card {
  min-height: 200px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-header span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.role-permissions {
  padding-top: 16px;
}

.permission-module {
  margin-bottom: 16px;
}

.permission-module h4 {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin: 0 0 8px;
}

.permission-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}
</style>
