const API_URL = 'http://localhost:3000/todos';

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const todoList = document.querySelector('#todoList');

document.addEventListener('DOMContentLoaded', fetchTodos);

async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to load tasks');
    
    const todos = await res.json();
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function renderTodos(todos) {
  todoList.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'todo-item__content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

    const span = document.createElement('span');
    span.textContent = todo.title;
    if (todo.completed) {
      span.classList.add('todo-item__title--completed');
    }

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false })
    });

    if (!res.ok) throw new Error('Failed to add task');

    todoInput.value = '';
    fetchTodos();
  } catch (error) {
    console.error('Error adding task:', error);
  }
});

async function toggleTodo(id, isCompleted) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: isCompleted })
    });

    if (!res.ok) throw new Error('Failed to update status');

    fetchTodos();
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Failed to delete task');

    fetchTodos();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}