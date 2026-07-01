import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/workplan/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'workplan-home',
      component: () => import('../views/workplan/LayoutView.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/workplan/DashboardView.vue')
        },
        {
          path: 'plan-create',
          name: 'plan-create',
          component: () => import('../views/workplan/PlanCreateView.vue')
        },
        {
          path: 'plan-list',
          name: 'plan-list',
          component: () => import('../views/workplan/PlanListView.vue')
        },
        {
          path: 'plan-review',
          name: 'plan-review',
          component: () => import('../views/workplan/PlanReviewView.vue')
        },
        {
          path: 'execution',
          name: 'execution',
          component: () => import('../views/workplan/ExecutionView.vue')
        },
        {
          path: 'assessment',
          name: 'assessment',
          component: () => import('../views/workplan/AssessmentView.vue')
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('../views/workplan/StatisticsView.vue')
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('../views/workplan/SystemView.vue')
        }
      ]
    }
  ],
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('workplan_token')
  if (to.meta.requiresAuth !== false && !token) {
    return '/login'
  }
})

export default router
