<template>
  <div class="projects-view">
    <ProjectsList />
  </div>
</template>

<script>
import ProjectsList from '@/components/ProjectsList.vue';

export default {
  name: 'ProjectsView',
  components: {
    ProjectsList
  }
};
</script>