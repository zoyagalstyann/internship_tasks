
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";
const PAGE_SIZE = 5;

function App() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addDepartmentId, setAddDepartmentId] = useState("");
  const [addProjectIds, setAddProjectIds] = useState([]);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editProjectIds, setEditProjectIds] = useState([]);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        sortBy: sortField,
        order: sortDirection,
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      const response = await fetch(`${API_URL}/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load users");
      }

      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDepartmentsAndProjects() {
    try {
      const [departmentResponse, projectResponse] = await Promise.all([
        fetch(`${API_URL}/departments`),
        fetch(`${API_URL}/projects`),
      ]);

      const departmentData = await departmentResponse.json();
      const projectData = await projectResponse.json();

      if (!departmentResponse.ok || !projectResponse.ok) {
        throw new Error("Could not load departments or projects");
      }

      setDepartments(
        Array.isArray(departmentData)
          ? departmentData
          : departmentData.departments || []
      );

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : projectData.projects || []
      );
    } catch (err) {
      setError(err.message || "Could not load departments and projects");
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search, sortField, sortDirection, page]);

  useEffect(() => {
    fetchDepartmentsAndProjects();
  }, []);

  function handleAddProjectChange(projectId) {
    setAddProjectIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId]
    );
  }

  async function handleAddUser(event) {
    event.preventDefault();
    setFormError("");
    setFormMessage("");

    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          departmentId: addDepartmentId
            ? Number(addDepartmentId)
            : null,
          projectIds: addProjectIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add user");
      }

      setName("");
      setEmail("");
      setAddDepartmentId("");
      setAddProjectIds([]);
      setFormMessage("User added successfully!");

      setSearch("");
      setPage(1);

      if (search === "" && page === 1) {
        await fetchUsers();
      }
    } catch (err) {
      setFormError(err.message || "Could not add user");
    } finally {
      setAdding(false);
    }
  }

  function startEditing(user) {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditDepartmentId(
      user.departmentId ? String(user.departmentId) : ""
    );
    setEditProjectIds(
      Array.isArray(user.projects)
        ? user.projects.map((project) => project.id)
        : []
    );
    setEditError("");
  }

  function handleEditProjectChange(projectId) {
    setEditProjectIds((currentIds) =>
      currentIds.includes(projectId)
        ? currentIds.filter((id) => id !== projectId)
        : [...currentIds, projectId]
    );
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    setEditError("");

    if (!editName.trim() || !editEmail.trim()) {
      setEditError("Name and email are required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName.trim(),
            email: editEmail.trim(),
            departmentId: editDepartmentId
              ? Number(editDepartmentId)
              : null,
            projectIds: editProjectIds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update user");
      }

      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setEditError(err.message || "Could not update user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete user");
      }

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      setError(err.message || "Could not delete user");
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(1);
  }

  function getSortSymbol(field) {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  return (
    <main className="app">
      <h1>User Management</h1>

      <section className="panel">
        <h2>Add User</h2>

        <form className="user-form" onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <select
            value={addDepartmentId}
            onChange={(event) =>
              setAddDepartmentId(event.target.value)
            }
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <div className="project-selection">
            <p>Projects</p>

            {projects.length === 0 ? (
              <p>No projects available</p>
            ) : (
              projects.map((project) => (
                <label key={project.id} className="project-option">
                  <input
                    type="checkbox"
                    checked={addProjectIds.includes(project.id)}
                    onChange={() =>
                      handleAddProjectChange(project.id)
                    }
                  />
                  {project.name}
                </label>
              ))
            )}
          </div>

          <button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add User"}
          </button>
        </form>

        {formError && <p className="error">{formError}</p>}
        {formMessage && <p className="success">{formMessage}</p>}
      </section>

      {editingUser && (
        <section className="panel">
          <h2>Edit User</h2>

          <form className="user-form" onSubmit={handleUpdateUser}>
            <input
              type="text"
              placeholder="Name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
            />

            <select
              value={editDepartmentId}
              onChange={(event) =>
                setEditDepartmentId(event.target.value)
              }
            >
              <option value="">No department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <div className="project-selection">
              <p>Projects</p>

              {projects.map((project) => (
                <label key={project.id} className="project-option">
                  <input
                    type="checkbox"
                    checked={editProjectIds.includes(project.id)}
                    onChange={() =>
                      handleEditProjectChange(project.id)
                    }
                  />
                  {project.name}
                </label>
              ))}
            </div>

            {editError && <p className="error">{editError}</p>}

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="table-heading">
          <h2>Users</h2>
          <p>Total users: {total}</p>
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <button
                      className="sort-button"
                      onClick={() => handleSort("id")}
                    >
                      ID{getSortSymbol("id")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-button"
                      onClick={() => handleSort("name")}
                    >
                      Name{getSortSymbol("name")}
                    </button>
                  </th>
                  <th>
                    <button
                      className="sort-button"
                      onClick={() => handleSort("email")}
                    >
                      Email{getSortSymbol("email")}
                    </button>
                  </th>
                  <th>Department</th>
                  <th>Projects</th>
                  <th>
                    <button
                      className="sort-button"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created At{getSortSymbol("createdAt")}
                    </button>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.department?.name || "—"}</td>
                      <td>
                        {user.projects?.length
                          ? user.projects
                              .map((project) => project.name)
                              .join(", ")
                          : "—"}
                      </td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => startEditing(user)}>
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
