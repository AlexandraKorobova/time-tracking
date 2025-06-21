<template>
  <div>
    <h2>Учет времени</h2>
    
    <div class="filters">
      <label>
        Дата:
        <input type="date" v-model="selectedDate" @change="fetchTimeEntries" />
      </label>
      <label>
        Месяц:
        <input type="month" v-model="selectedMonth" @change="fetchTimeEntriesByMonth" />
      </label>
      <button @click="showAllEntries">Показать все</button>
    </div>
    
    <DailySummary :date="selectedDate" />
    
    <TimeEntryForm 
      v-if="showEntryForm" 
      :entry="editingEntry" 
      @save="handleSaveEntry" 
      @cancel="cancelEditEntry" 
    />
    
    <button @click="addNewEntry">Добавить проводку</button>
    
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Часы</th>
          <th>Задача</th>
          <th>Проект</th>
          <th>Описание</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in timeEntries" :key="entry.id" :class="getRowClass(entry)">
          <td>{{ formatDate(entry.entry_date) }}</td>
          <td>{{ entry.hours }}</td>
          <td>{{ entry.task_name }}</td>
          <td>{{ entry.project_name }}</td>
          <td>{{ entry.description }}</td>
          <td>
            <button @click="editEntry(entry)">Редактировать</button>
            <button @click="deleteEntry(entry.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import TimeEntryForm from './TimeEntryForm.vue';
import DailySummary from './DailySummary.vue';

export default {
  components: {
    TimeEntryForm,
    DailySummary
  },
  data() {
    return {
      timeEntries: [],
      selectedDate: new Date().toISOString().split('T')[0],
      selectedMonth: new Date().toISOString().substr(0, 7),
      showEntryForm: false,
      editingEntry: null
    };
  },
  async created() {
    await this.fetchTimeEntries();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    getRowClass(entry) {
      const date = entry.entry_date;
      const totalHours = this.timeEntries
        .filter(e => e.entry_date === date)
        .reduce((sum, e) => sum + parseFloat(e.hours), 0);
      
      if (totalHours < 8) return 'yellow-row';
      if (totalHours === 8) return 'green-row';
      return 'red-row';
    },
    async fetchTimeEntries() {
      try {
        const response = await axios.get('http://localhost:5000/api/time-entries', {
          params: { date: this.selectedDate }
        });
        this.timeEntries = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке проводок:', error);
        alert('Не удалось загрузить проводки');
      }
    },
    async fetchTimeEntriesByMonth() {
      try {
        const response = await axios.get('http://localhost:5000/api/time-entries', {
          params: { month: this.selectedMonth }
        });
        this.timeEntries = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке проводок:', error);
        alert('Не удалось загрузить проводки');
      }
    },
    async showAllEntries() {
      try {
        const response = await axios.get('http://localhost:5000/api/time-entries');
        this.timeEntries = response.data;
        this.selectedDate = '';
        this.selectedMonth = '';
      } catch (error) {
        console.error('Ошибка при загрузке проводок:', error);
        alert('Не удалось загрузить проводки');
      }
    },
    addNewEntry() {
      this.editingEntry = null;
      this.showEntryForm = true;
    },
    editEntry(entry) {
      this.editingEntry = { ...entry };
      this.showEntryForm = true;
    },
    cancelEditEntry() {
      this.showEntryForm = false;
      this.editingEntry = null;
    },
    async handleSaveEntry() {
      this.showEntryForm = false;
      await this.fetchTimeEntries();
    },
    async deleteEntry(id) {
      if (confirm('Вы уверены, что хотите удалить эту проводку?')) {
        try {
          await axios.delete(`http://localhost:5000/api/time-entries/${id}`);
          await this.fetchTimeEntries();
        } catch (error) {
          console.error('Ошибка при удалении проводки:', error);
          alert('Не удалось удалить проводку');
        }
      }
    }
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

.filters {
  margin: 20px 0;
}

.filters label {
  margin-right: 15px;
}
</style>