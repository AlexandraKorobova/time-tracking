<template>
  <div class="reports-view">
    <h2>Отчеты</h2>
    <div class="report-filters">
      <label>
        Месяц:
        <input type="month" v-model="selectedMonth" @change="fetchReportData" />
      </label>
    </div>
    
    <div v-if="reportData.length > 0">
      <h3>Сводка за {{ selectedMonth }}</h3>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Всего часов</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in reportData" :key="day.date" :class="getRowClass(day)">
            <td>{{ day.date }}</td>
            <td>{{ day.total_hours }}</td>
            <td>{{ getStatusText(day.total_hours) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>Нет данных для отображения</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedMonth: new Date().toISOString().substr(0, 7),
      reportData: []
    };
  },
  methods: {
    async fetchReportData() {
      try {
        const response = await axios.get('http://localhost:5000/api/time-entries', {
          params: { month: this.selectedMonth }
        });
        
        // Группируем данные по дням
        const groupedData = {};
        response.data.forEach(entry => {
          if (!groupedData[entry.entry_date]) {
            groupedData[entry.entry_date] = {
              date: entry.entry_date,
              total_hours: 0
            };
          }
          groupedData[entry.entry_date].total_hours += parseFloat(entry.hours);
        });
        
        this.reportData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
      } catch (error) {
        console.error('Ошибка при загрузке отчета:', error);
        this.reportData = [];
      }
    },
    getRowClass(day) {
      if (day.total_hours < 8) return 'yellow-row';
      if (day.total_hours === 8) return 'green-row';
      return 'red-row';
    },
    getStatusText(hours) {
      if (hours < 8) return 'Недостаточно';
      if (hours === 8) return 'Норма';
      return 'Избыточно';
    }
  },
  created() {
    this.fetchReportData();
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.yellow-row {
  background-color: #fffacd;
}

.green-row {
  background-color: #e6ffe6;
}

.red-row {
  background-color: #ffcccc;
}

.report-filters {
  margin: 20px 0;
}
</style>