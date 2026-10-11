import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [userId, setUserId] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const limit = 5;

  async function fetchTasks() {
    const params = new URLSearchParams({
      page,
      limit
    });

    if (statusFilter) {
      params.append("status", statusFilter);
    }

    const response = await fetch(`${API_URL}/tasks?${params}`);
    const data = await response.json();

    setTasks(data.tasks);
    setTotal(data.total);
  }

  async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();

    setUsers(data);
  }

  async function fetchCategories() {
    const response = await fetch(`${API_URL}/categories`);
    const data = await response.json();

    setCategories(data);
  }

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter]);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const taskData = {
      title,
      description,
      status,
      userId: Number(userId)
    };

    let taskId = editingId;

    if (editingId) {
      await fetch(`${API_URL}/tasks/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });
    } else {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });

      const newTask = await response.json();
      taskId = newTask.id;
    }

    await fetch(`${API_URL}/tasks/${taskId}/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        categoryIds: selectedCategories
      })
    });

    resetForm();
    setPage(1);
    fetchTasks();
  }

  function editTask(task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setUserId(String(task.userId));

    setSelectedCategories(
      task.categories ? task.categories.map(category => category.id) : []
    );
  }

  async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE"
    });

    fetchTasks();
  }

  function cancelEdit() {
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
    setUserId("");
    setSelectedCategories([]);
  }

  function toggleCategory(categoryId) {
    setSelectedCategories(current => {
      if (current.includes(categoryId)) {
        return current.filter(id => id !== categoryId);
      }

      return [...current, categoryId];
    });
  }

  async function createCategory(event) {
    event.preventDefault();

    if (!categoryTitle) {
      return;
    }

    const response = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: categoryTitle,
        description: categoryDescription
      })
    });

    const newCategory = await response.json();

    setCategories(current => [...current, newCategory]);
    setSelectedCategories(current => [...current, newCategory.id]);

    setCategoryTitle("");
    setCategoryDescription("");
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="app">
      <h1>Task Manager</h1>

      <form onSubmit={handleSubmit} className="task-form">
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="Task title"
          required
        />

        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Task description"
          required
        />

        <select
          value={status}
          onChange={event => setStatus(event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={userId}
          onChange={event => setUserId(event.target.value)}
          required
        >
          <option value="">Select user</option>

          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <div className="categories">
  <h3>Choose Categories</h3>

  {categories.map(category => (
    <label key={category.id} className="category-option">
      <input
        type="checkbox"
        checked={selectedCategories.includes(category.id)}
        onChange={() => toggleCategory(category.id)}
      />
      <span>{category.title}</span>
    </label>
  ))}
</div>

        <div className="new-category">
          <h3>Create New Category</h3>

          <input
            value={categoryTitle}
            onChange={event => setCategoryTitle(event.target.value)}
            placeholder="Category title"
          />

          <input
            value={categoryDescription}
            onChange={event => setCategoryDescription(event.target.value)}
            placeholder="Category description"
          />

          <button type="button" onClick={createCategory}>
            Add Category
          </button>
        </div>

        <button type="submit">
          {editingId ? "Update Task" : "Add Task"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <div className="filter">
        <label>Filter:</label>

        <select
          value={statusFilter}
          onChange={event => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="tasks">
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map(task => (
            <div className="task" key={task.id}>
              <h2>{task.title}</h2>

              <p>{task.description}</p>

              <span className={`status ${task.status}`}>
                {task.status}
              </span>

              <p>
                <strong>User:</strong>{" "}
                {users.find(user => user.id === task.userId)?.name ||
                  task.userId}
              </p>

              <div className="task-categories">
                <strong>Categories:</strong>

                {task.categories && task.categories.length > 0 ? (
                  <div>
                    {task.categories.map(category => (
                      <span
                        className="category"
                        key={category.id}
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span> No categories</span>
                )}
              </div>

              <div className="actions">
                <button onClick={() => editTask(task)}>
                  Edit
                </button>

                <button onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;