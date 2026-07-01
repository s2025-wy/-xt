<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>首页仪表盘</h1>
      <p>欢迎回来，{{ userInfo.username }}！这是您的工作概览</p>
    </div>
    
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">12</span>
            <span class="stat-label">待审核计划</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon progress">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">85%</span>
            <span class="stat-label">本月完成率</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon completed">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">28</span>
            <span class="stat-label">已完成任务</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon overdue">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">3</span>
            <span class="stat-label">即将逾期</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="dashboard-row">
      <el-card class="main-card">
        <template #header>
          <div class="card-header">
            <h3>今日待办</h3>
            <el-button type="primary" size="small" @click="$router.push('/plan-create')">
              <el-icon><Plus /></el-icon>
              新建计划
            </el-button>
          </div>
        </template>
        
        <div class="todo-list">
          <div 
            v-for="item in todoList" 
            :key="item.id" 
            class="todo-item"
            :class="{ overdue: item.overdue }"
          >
            <div class="todo-checkbox">
              <el-checkbox v-model="item.completed" />
            </div>
            <div class="todo-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <div class="todo-meta">
                <span class="priority" :class="item.priority">
                  {{ item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级' }}
                </span>
                <span class="deadline">截止: {{ item.deadline }}</span>
              </div>
            </div>
            <div class="todo-actions">
              <el-button size="small" @click="viewPlan(item.id)">查看</el-button>
              <el-button size="small" type="warning" @click="updateProgress(item.id)">更新进度</el-button>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="side-card">
        <template #header>
          <h3>最近动态</h3>
        </template>
        
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <el-icon :component="getActivityIcon(activity.type)" />
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="dashboard-row">
      <el-card class="main-card">
        <template #header>
          <h3>本周计划完成趋势</h3>
        </template>
        
        <div class="chart-container">
          <div class="simple-chart">
            <div class="chart-bars">
              <div v-for="(item, index) in weeklyData" :key="index" class="bar-item">
                <div class="bar-wrapper">
                  <div class="bar" :style="{ height: item.percentage + '%' }"></div>
                </div>
                <span class="bar-label">{{ item.day }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="side-card">
        <template #header>
          <h3>部门排名</h3>
        </template>
        
        <div class="ranking-list">
          <div v-for="(item, index) in departmentRanking" :key="index" class="ranking-item">
            <span class="ranking-number" :class="{ top: index < 3 }">{{ index + 1 }}</span>
            <div class="ranking-info">
              <span class="ranking-name">{{ item.name }}</span>
              <div class="ranking-progress">
                <el-progress :percentage="item.rate" :stroke-width="6" />
              </div>
            </div>
            <span class="ranking-rate">{{ item.rate }}%</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, TrendCharts, CircleCheck, Warning, Plus, Document, User, Star } from '@element-plus/icons-vue'
import type { Component } from 'vue'

const userInfo = computed(() => {
  const userStr = localStorage.getItem('workplan_user')
  return userStr ? JSON.parse(userStr) : { username: '用户', role: '' }
})

const todoList = ref([
  { id: 1, title: '完成项目需求文档', description: '编写Q3产品需求文档，包括功能列表和技术方案', priority: 'high', deadline: '今天', completed: false, overdue: false },
  { id: 2, title: '代码审查会议', description: '参加团队代码审查会议，评审新功能代码', priority: 'medium', deadline: '今天', completed: false, overdue: false },
  { id: 3, title: '周报编写', description: '编写本周工作周报，总结工作进展', priority: 'medium', deadline: '明天', completed: false, overdue: false },
  { id: 4, title: '修复Bug #2841', description: '修复登录页面验证码不显示的问题', priority: 'high', deadline: '明天', completed: false, overdue: false },
  { id: 5, title: '客户需求沟通', description: '与客户沟通新功能需求，确认需求细节', priority: 'low', deadline: '本周', completed: false, overdue: true }
])

const activities = ref([
  { id: 1, type: 'review', message: '您的计划「Q3产品规划」已通过审核', time: '10分钟前' },
  { id: 2, type: 'complete', message: '任务「修复登录Bug」已完成', time: '30分钟前' },
  { id: 3, type: 'create', message: '张三提交了新的周计划', time: '1小时前' },
  { id: 4, type: 'score', message: '您的上月考核评分已发布', time: '2小时前' },
  { id: 5, type: 'remind', message: '任务「周报编写」即将到期', time: '3小时前' }
])

const weeklyData = ref([
  { day: '周一', percentage: 75 },
  { day: '周二', percentage: 82 },
  { day: '周三', percentage: 68 },
  { day: '周四', percentage: 90 },
  { day: '周五', percentage: 85 },
  { day: '周六', percentage: 45 },
  { day: '周日', percentage: 30 }
])

const departmentRanking = ref([
  { name: '研发部', rate: 92 },
  { name: '产品部', rate: 88 },
  { name: '市场部', rate: 85 },
  { name: '运营部', rate: 80 },
  { name: '财务部', rate: 75 }
])

const getActivityIcon = (type: string): Component => {
  const icons: Record<string, Component> = {
    review: Document,
    complete: CircleCheck,
    create: Plus,
    score: Star,
    remind: Clock
  }
  return icons[type] || Document
}

const viewPlan = (id: number) => {
  console.log('查看计划:', id)
}

const updateProgress = (id: number) => {
  console.log('更新进度:', id)
}
</script>

<style scoped>
.dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.stat-icon.pending {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.progress {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.completed {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.overdue {
  background: #fff1f0;
  color: #ff4d4f;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f5f5f5;
}

.todo-item.overdue {
  border-left: 4px solid #ff4d4f;
}

.todo-content {
  flex: 1;
}

.todo-content h4 {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 4px;
}

.todo-content p {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px;
}

.todo-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.priority {
  padding: 2px 8px;
  border-radius: 4px;
}

.priority.high {
  background: #fff1f0;
  color: #ff4d4f;
}

.priority.medium {
  background: #fff7e6;
  color: #fa8c16;
}

.priority.low {
  background: #f6ffed;
  color: #52c41a;
}

.deadline {
  color: #909399;
}

.todo-actions {
  display: flex;
  gap: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  flex-shrink: 0;
}

.activity-icon.review {
  background: #e6f7ff;
  color: #1890ff;
}

.activity-icon.complete {
  background: #f6ffed;
  color: #52c41a;
}

.activity-icon.create {
  background: #fff7e6;
  color: #fa8c16;
}

.activity-icon.score {
  background: #f9f0ff;
  color: #722ed1;
}

.activity-icon.remind {
  background: #fff1f0;
  color: #ff4d4f;
}

.activity-content p {
  font-size: 13px;
  color: #606266;
  margin: 0 0 4px;
}

.activity-time {
  font-size: 12px;
  color: #c0c4cc;
}

.chart-container {
  padding: 16px 0;
}

.simple-chart {
  height: 200px;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-wrapper {
  width: 40px;
  height: 160px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 12px;
  color: #909399;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #909399;
}

.ranking-number.top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 14px;
  color: #606266;
  display: block;
  margin-bottom: 4px;
}

.ranking-progress {
  width: 100%;
}

.ranking-rate {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}
</style>
