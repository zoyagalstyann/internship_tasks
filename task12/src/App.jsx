import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [editingId, setEditingId] = useState(null);

  const limit = 5;

  async function fetchTasks() {
    const params = new URLSearchParams({
      page,
      limit
    });

    if (statusFilter) {
      params.append("status", statusFilter);
    }

    const response = await fetch(`/tasks?${params}`);
    const data = await response.json();

    setTasks(data.tasks);
    setTotal(data.total);
  }

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();

    const taskData = {
      title,
      description,
      status
    };

    if (editingId) {
      await fetch(`/tasks/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });
    } else {
      await fetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });
    }

    setTitle("");
    setDescription("");
    setStatus("pending");
    setEditingId(null);
    setPage(1);

    fetchTasks();
  }

  function editTask(task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  }

  async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {
      method: "DELETE"
    });

    fetchTasks();
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
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
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

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
          <option value="in-progress">In Progress</option>
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
