<template>
  <div class="tasks-view">
    <TasksList />
  </div>
</template>

<script>
import TasksList from '@/components/TasksList.vue';

export default {
  name: 'TasksView',
  components: {
    TasksList
  }
};
</script>