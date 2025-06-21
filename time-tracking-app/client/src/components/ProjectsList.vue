<template>
  <div>
    <h2>Список проектов</h2>
    <button @click="showAddForm = true">Добавить проект</button>
    
    <div v-if="showAddForm" class="form-container">
      <h3>{{ editingProject ? 'Редактировать проект' : 'Добавить проект' }}</h3>
      <input v-model="projectForm.name" placeholder="Название" />
      <input v-model="projectForm.description" placeholder="Описание" />
      <label>
        Активный:
        <input type="checkbox" v-model="projectForm.is_active" />
      </label>
      <button @click="saveProject">Сохранить</button>
      <button @click="cancelEdit">Отмена</button>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Описание</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project.id">
          <td>{{ project.id }}</td>
          <td>{{ project.name }}</td>
          <td>{{ project.description }}</td>
          <td>{{ project.is_active ? 'Активный' : 'Неактивный' }}</td>
          <td>
            <button @click="editProject(project)">Редактировать</button>
            <button @click="deleteProject(project.id)">Удалить</button>
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
      projects: [],
      showAddForm: false,
      editingProject: null,
      projectForm: {
        name: '',
        description: '',
        is_active: true
      }
    };
  },
  async created() {
    await this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await axios.get('http://localhost:5000/api/projects');
        this.projects = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        alert('Не удалось загрузить проекты');
      }
    },
    editProject(project) {
      this.editingProject = project;
      this.projectForm = {
        name: project.name,
        description: project.description,
        is_active: project.is_active
      };
      this.showAddForm = true;
    },
    cancelEdit() {
      this.showAddForm = false;
      this.editingProject = null;
      this.projectForm = {
        name: '',
        description: '',
        is_active: true
      };
    },
    async saveProject() {
      try {
        if (this.editingProject) {
          await axios.put(`http://localhost:5000/api/projects/${this.editingProject.id}`, this.projectForm);
        } else {
          await axios.post('http://localhost:5000/api/projects', this.projectForm);
        }
        await this.fetchProjects();
        this.cancelEdit();
      } catch (error) {
        console.error('Ошибка при сохранении проекта:', error);
        alert('Не удалось сохранить проект');
      }
    },
    async deleteProject(id) {
      if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        try {
          await axios.delete(`http://localhost:5000/api/projects/${id}`);
          await this.fetchProjects();
        } catch (error) {
          console.error('Ошибка при удалении проекта:', error);
          alert('Не удалось удалить проект');
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

input, button {
  margin: 5px;
}
</style>