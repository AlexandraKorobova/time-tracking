<template>
  <div class="form-container">
    <h3>{{ editing ? 'Редактировать проводку' : 'Добавить проводку' }}</h3>
    
    <label>
      Дата:
      <input type="date" v-model="form.entry_date" :disabled="editing && !form.entry_date" />
    </label>
    
    <label>
      Часы:
      <input type="number" v-model="form.hours" min="0.1" max="24" step="0.1" />
    </label>
    
    <label>
      Задача:
      <select v-model="form.task_id" :disabled="editing && !form.task_id">
        <option v-for="task in activeTasks" :value="task.id" :key="task.id">
          {{ task.name }} ({{ task.project_name }})
        </option>
      </select>
    </label>
    
    <label>
      Описание:
      <input v-model="form.description" />
    </label>
    
    <button @click="save">Сохранить</button>
    <button @click="cancel">Отмена</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    entry: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        entry_date: '',
        hours: 1,
        task_id: null,
        description: ''
      },
      tasks: []
    };
  },
  computed: {
    editing() {
      return this.entry !== null;
    },
    activeTasks() {
      return this.tasks.filter(task => task.is_active);
    }
  },
  async created() {
    await this.fetchTasks();
    if (this.entry) {
      this.form = { ...this.entry };
    } else {
      this.form.entry_date = new Date().toISOString().split('T')[0];
    }
  },
  methods: {
    async fetchTasks() {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        this.tasks = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
        alert('Не удалось загрузить задачи');
      }
    },
    async save() {
      try {
        if (this.editing) {
          await axios.put(`http://localhost:5000/api/time-entries/${this.entry.id}`, this.form);
        } else {
          await axios.post('http://localhost:5000/api/time-entries', this.form);
        }
        this.$emit('save');
      } catch (error) {
        console.error('Ошибка при сохранении проводки:', error);
        alert(error.response?.data?.error || 'Не удалось сохранить проводку');
      }
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.form-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

label {
  display: block;
  margin: 10px 0;
}

input, select {
  margin-left: 10px;
}

button {
  margin-right: 10px;
}
</style>