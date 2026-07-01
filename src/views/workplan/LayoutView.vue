<template>
  <div class="workplan-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>工作计划管理系统</h2>
      </div>
      
      <el-menu 
        :default-active="activeMenu" 
        class="sidebar-menu"
        router
        mode="vertical"
        background-color="#2d3748"
        text-color="#a0aec0"
        active-text-color="#fff"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="plan">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>计划管理</span>
          </template>
          <el-menu-item index="/plan-create">
            <el-icon><Plus /></el-icon>
            <span>制定计划</span>
          </el-menu-item>
          <el-menu-item index="/plan-list">
            <el-icon><List /></el-icon>
            <span>我的计划</span>
          </el-menu-item>
          <el-menu-item index="/plan-review">
            <el-icon><CircleCheck /></el-icon>
            <span>计划审核</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/execution">
          <el-icon><DataAnalysis /></el-icon>
          <span>执行跟踪</span>
        </el-menu-item>
        
        <el-menu-item index="/assessment">
          <el-icon><Star /></el-icon>
          <span>考核评分</span>
        </el-menu-item>
        
        <el-menu-item index="/statistics">
          <el-icon><DataBoard /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        
        <el-menu-item index="/system">
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar">
            <el-icon><MenuIcon /></el-icon>
          </button>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="header-right">
          <div class="notification">
            <el-badge :value="3" :hidden="false">
              <el-button circle icon="Bell" />
            </el-badge>
          </div>
          
          <div class="user-info">
            <el-dropdown>
              <span class="dropdown-trigger">
                <el-avatar size="small">{{ userInfo.username?.charAt(0) || 'U' }}</el-avatar>
                <span>{{ userInfo.username || '用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </header>
      
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, Document, Plus, List, CircleCheck, DataAnalysis, Star, DataBoard, Setting, ArrowDown, Menu as MenuIcon } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)

const userInfo = computed(() => {
  const userStr = localStorage.getItem('workplan_user')
  return userStr ? JSON.parse(userStr) : { username: '', role: '' }
})

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '首页仪表盘',
    '/plan-create': '制定计划',
    '/plan-list': '我的计划',
    '/plan-review': '计划审核',
    '/execution': '执行跟踪',
    '/assessment': '考核评分',
    '/statistics': '数据统计',
    '/system': '系统管理'
  }
  return titles[route.path] || ''
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleLogout = () => {
  localStorage.removeItem('workplan_token')
  localStorage.removeItem('workplan_role')
  localStorage.removeItem('workplan_user')
  router.push('/login')
}
</script>

<style scoped>
.workplan-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 250px;
  background: #2d3748;
  color: #fff;
  flex-shrink: 0;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #4a5568;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  border-right: none;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 4px;
}

.sidebar-toggle:hover {
  background: #f0f0f0;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}

.dropdown-trigger:hover {
  background: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
