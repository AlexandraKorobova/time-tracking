<template>
  <div>
    <h2>Список задач</h2>
    <button @click="showAddForm = true">Добавить задачу</button>
    
    <div v-if="showAddForm" class="form-container">
      <h3>{{ editingTask ? 'Редактировать задачу' : 'Добавить задачу' }}</h3>
      <input v-model="taskForm.name" placeholder="Название" />
      <select v-model="taskForm.project_id">
        <option v-for="project in activeProjects" :value="project.id" :key="project.id">
          {{ project.name }}
        </option>
      </select>
      <label>
        Активная:
        <input type="checkbox" v-model="taskForm.is_active" />
      </label>
      <button @click="saveTask">Сохранить</button>
      <button @click="cancelEdit">Отмена</button>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Проект</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.id }}</td>
          <td>{{ task.name }}</td>
          <td>{{ task.project_name }}</td>
          <td>{{ task.is_active ? 'Активная' : 'Неактивная' }}</td>
          <td>
            <button @click="editTask(task)">Редактировать</button>
            <button @click="deleteTask(task.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      tasks: [],
      projects: [],
      showAddForm: false,
      editingTask: null,
      taskForm: {
        name: '',
        project_id: null,
        is_active: true
      }
    };
  },
  async created() {
    await this.fetchTasks();
    await this.fetchProjects();
  },
  computed: {
    activeProjects() {
      return this.projects.filter(project => project.is_active);
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
    async fetchProjects() {
      try {
        const response = await axios.get('http://localhost:5000/api/projects');
        this.projects = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        alert('Не удалось загрузить проекты');
      }
    },
    editTask(task) {
      this.editingTask = task;
      this.taskForm = {
        name: task.name,
        project_id: task.project_id,
        is_active: task.is_active
      };
      this.showAddForm = true;
    },
    cancelEdit() {
      this.showAddForm = false;
      this.editingTask = null;
      this.taskForm = {
        name: '',
        project_id: null,
        is_active: true
      };
    },
    async saveTask() {
      try {
        if (this.editingTask) {
          await axios.put(`http://localhost:5000/api/tasks/${this.editingTask.id}`, this.taskForm);
        } else {
          await axios.post('http://localhost:5000/api/tasks', this.taskForm);
        }
        await this.fetchTasks();
        this.cancelEdit();
      } catch (error) {
        console.error('Ошибка при сохранении задачи:', error);
        alert('Не удалось сохранить задачу');
      }
    },
    async deleteTask(id) {
      if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        try {
          await axios.delete(`http://localhost:5000/api/tasks/${id}`);
          await this.fetchTasks();
        } catch (error) {
          console.error('Ошибка при удалении задачи:', error);
          alert('Не удалось удалить задачу');
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

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.form-container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
}

input, select, button {
  margin: 5px;
}
</style>