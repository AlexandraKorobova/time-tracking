import { createRouter, createWebHistory } from 'vue-router';
import ProjectsView from '../views/ProjectsView.vue';
import TasksView from '../views/TasksView.vue';
import TimeTrackerView from '../views/TimeTrackerView.vue';
import ReportsView from '../views/ReportsView.vue';

const routes = [
  {
    path: '/projects',
    name: 'Projects',
    component: ProjectsView
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksView
  },
  {
    path: '/time-tracker',
    name: 'TimeTracker',
    component: TimeTrackerView
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView
  },
  {
    path: '/',
    redirect: '/time-tracker'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;