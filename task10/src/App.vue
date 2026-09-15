<script setup>
import { ref } from "vue";

const todos = ref([]);
const newTodo = ref("");

function addTodo() {
  if (newTodo.value.trim() === "") return;

  todos.value.push({
    id: Date.now(),
    text: newTodo.value,
    completed: false
  });

  newTodo.value = "";
}

function deleteTodo(id) {
  todos.value = todos.value.filter(todo => todo.id !== id);
}
</script>

<template>
  <div class="todo-app">
    <h1>TODO App</h1>

    <form @submit.prevent="addTodo">
      <input
        v-model="newTodo"
        placeholder="Enter a task"
      >

      <button type="submit">
        Add
      </button>
    </form>

    <p v-if="todos.length === 0" class="empty">
      No tasks yet.
    </p>

    <ul v-else>
      <li v-for="todo in todos" :key="todo.id">
        <label>
          <input
            type="checkbox"
            v-model="todo.completed"
          >

          <span :class="{ completed: todo.completed }">
            {{ todo.text }}
          </span>
        </label>

        <button
          class="delete-button"
          @click="deleteTodo(todo.id)"
        >
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.todo-app {
  width: 400px;
  margin: 50px auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
}

form {
  display: flex;
  gap: 10px;
}

input:not([type="checkbox"]) {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

form button {
  background: green;
  color: white;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-button {
  background: red;
  color: white;
}

.completed {
  text-decoration: line-through;
}

.empty {
  text-align: center;
  margin-top: 20px;
}
</style>