<template>
  <div class="summary" :class="summaryClass">
    <h3>Сводка за день: {{ date }}</h3>
    <p>Всего часов: {{ totalHours }}</p>
    <p>{{ summaryText }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    date: String
  },
  data() {
    return {
      totalHours: 0
    };
  },
  computed: {
    summaryClass() {
      if (this.totalHours < 8) return 'yellow';
      if (this.totalHours === 8) return 'green';
      return 'red';
    },
    summaryText() {
      if (this.totalHours < 8) return 'Вы внесли недостаточно часов (меньше 8)';
      if (this.totalHours === 8) return 'Вы внесли достаточно часов (ровно 8)';
      return 'Вы внесли избыточно часов (больше 8)';
    }
  },
  watch: {
    date: {
      immediate: true,
      async handler(newDate) {
        if (newDate) {
          try {
            const response = await axios.get('http://localhost:5000/api/daily-hours', {
              params: { date: newDate }
            });
            this.totalHours = response.data.total;
          } catch (error) {
            console.error('Ошибка при загрузке сводки:', error);
            this.totalHours = 0;
          }
        } else {
          this.totalHours = 0;
        }
      }
    }
  }
};
</script>

<style scoped>
.summary {
  padding: 15px;
  margin: 15px 0;
  border-radius: 5px;
}

.yellow {
  background-color: #fffacd;
  border: 1px solid #e6d800;
}

.green {
  background-color: #e6ffe6;
  border: 1px solid #00e600;
}

.red {
  background-color: #ffcccc;
  border: 1px solid #ff0000;
}
</style>