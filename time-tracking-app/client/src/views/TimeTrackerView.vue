<template>
  <div class="time-tracker-view">
    <TimeEntriesList />
  </div>
</template>

<script>
import TimeEntriesList from '@/components/TimeEntriesList.vue';

export default {
  name: 'TimeTrackerView',
  components: {
    TimeEntriesList
  }
};
</script>