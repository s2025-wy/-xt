<template>
  <div class="statistics">
    <div class="page-header">
      <h1>数据统计</h1>
      <p>查看系统数据统计和报表</p>
    </div>
    
    <div class="filter-bar">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 300px" />
      
      <el-select v-model="filterDepartment" placeholder="部门筛选" style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="研发部" value="rd" />
        <el-option label="产品部" value="product" />
        <el-option label="市场部" value="marketing" />
      </el-select>
      
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="exportReport">导出报表</el-button>
    </div>
    
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">156</span>
          <span class="stat-label">总计划数</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">85%</span>
          <span class="stat-label">完成率</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">48</span>
          <span class="stat-label">待审核</span>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <span class="stat-value">12</span>
          <span class="stat-label">逾期计划</span>
        </div>
      </el-card>
    </div>
    
    <div class="chart-row">
      <el-card class="chart-card">
        <template #header>
          <h3>各部门计划完成率</h3>
        </template>
        <div class="bar-chart">
          <div v-for="item in departmentData" :key="item.name" class="bar-item">
            <span class="bar-label">{{ item.name }}</span>
            <div class="bar-wrapper">
              <div class="bar" :style="{ width: item.rate + '%', background: item.color }"></div>
            </div>
            <span class="bar-value">{{ item.rate }}%</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <h3>计划状态分布</h3>
        </template>
        <div class="pie-chart-container">
          <div class="pie-chart">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#52c41a" stroke-width="20" :stroke-dasharray="statusData && statusData[0] ? statusData[0].percent * 2.51 + ' 251' : '0 251'" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1890ff" stroke-width="20" :stroke-dasharray="statusData && statusData[1] ? statusData[1].percent * 2.51 + ' 251' : '0 251'" :stroke-dashoffset="statusData && statusData[0] ? -statusData[0].percent * 2.51 : 0" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#fa8c16" stroke-width="20" :stroke-dasharray="statusData && statusData[2] ? statusData[2].percent * 2.51 + ' 251' : '0 251'" :stroke-dashoffset="statusData && statusData[0] && statusData[1] ? -(statusData[0].percent + statusData[1].percent) * 2.51 : 0" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ff4d4f" stroke-width="20" :stroke-dasharray="statusData && statusData[3] ? statusData[3].percent * 2.51 + ' 251' : '0 251'" :stroke-dashoffset="statusData && statusData[0] && statusData[1] && statusData[2] ? -(statusData[0].percent + statusData[1].percent + statusData[2].percent) * 2.51 : 0" />
            </svg>
          </div>
          <div class="pie-legend">
            <div v-for="item in statusData" :key="item.name" class="legend-item">
              <span class="legend-color" :style="{ background: item.color }"></span>
              <span class="legend-name">{{ item.name }}</span>
              <span class="legend-value">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="chart-row">
      <el-card class="chart-card">
        <template #header>
          <h3>月度计划趋势</h3>
        </template>
        <div class="line-chart">
          <svg viewBox="0 0 500 200">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#667eea" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#667eea" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#lineGradient)" />
            <path :d="linePath" fill="none" stroke="#667eea" stroke-width="3" />
            <circle v-for="(point, index) in linePoints" :key="index" :cx="point.x" :cy="point.y" r="5" fill="#fff" stroke="#667eea" stroke-width="2" />
          </svg>
          <div class="line-labels">
            <span v-for="month in months" :key="month">{{ month }}</span>
          </div>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <template #header>
          <h3>考核等级分布</h3>
        </template>
        <div class="level-chart">
          <div v-for="item in levelData" :key="item.name" class="level-item">
            <div class="level-bar" :style="{ height: item.count * 8 + 'px', background: item.color }"></div>
            <span class="level-name">{{ item.name }}</span>
            <span class="level-count">{{ item.count }}人</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const dateRange = ref<[string, string] | []>([])
const filterDepartment = ref('')

const departmentData = ref([
  { name: '研发部', rate: 92, color: '#667eea' },
  { name: '产品部', rate: 88, color: '#764ba2' },
  { name: '市场部', rate: 85, color: '#f093fb' },
  { name: '运营部', rate: 80, color: '#f5576c' },
  { name: '财务部', rate: 75, color: '#4facfe' }
])

const statusData = ref([
  { name: '已完成', percent: 55, color: '#52c41a' },
  { name: '进行中', percent: 25, color: '#1890ff' },
  { name: '待审核', percent: 15, color: '#fa8c16' },
  { name: '已退回', percent: 5, color: '#ff4d4f' }
])

const months = ref(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])
const monthlyData = ref([30, 45, 52, 48, 60, 55, 70, 65, 80, 75, 85, 90])

const linePoints = computed(() => {
  const width = 500
  const height = 180
  const padding = 40
  const xStep = (width - padding * 2) / (monthlyData.value.length - 1)
  const maxValue = Math.max(...monthlyData.value)
  
  return monthlyData.value.map((value, index) => ({
    x: padding + index * xStep,
    y: height - padding - (value / maxValue) * (height - padding * 2)
  }))
})

const linePath = computed(() => {
  if (linePoints.value.length === 0) return ''
  return linePoints.value.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')
})

const areaPath = computed(() => {
  if (linePoints.value.length === 0) return ''
  const firstPoint = linePoints.value[0]
  const lastPoint = linePoints.value[linePoints.value.length - 1]
  if (!firstPoint || !lastPoint) return ''
  return `${linePath.value} L ${lastPoint.x} 180 L ${firstPoint.x} 180 Z`
})

const levelData = ref([
  { name: '优秀', count: 15, color: '#52c41a' },
  { name: '良好', count: 28, color: '#1890ff' },
  { name: '合格', count: 12, color: '#fa8c16' },
  { name: '待改进', count: 5, color: '#ff4d4f' }
])

const handleSearch = () => {
  console.log('查询:', dateRange.value, filterDepartment.value)
}

const exportReport = () => {
  alert('报表导出功能')
}
</script>

<style scoped>
.statistics {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  min-height: 300px;
}

.chart-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.bar-wrapper {
  flex: 1;
  height: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.bar-value {
  width: 60px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  text-align: right;
  flex-shrink: 0;
}

.pie-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  height: 250px;
}

.pie-chart {
  width: 150px;
  height: 150px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-name {
  width: 60px;
  font-size: 14px;
  color: #606266;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.line-chart {
  padding: 20px 0;
}

.line-chart svg {
  width: 100%;
  height: 200px;
}

.line-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  font-size: 12px;
  color: #909399;
}

.level-chart {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 40px;
  height: 250px;
  padding: 20px 0;
}

.level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.level-bar {
  width: 60px;
  border-radius: 8px 8px 0 0;
  min-height: 8px;
}

.level-name {
  font-size: 14px;
  color: #606266;
}

.level-count {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
