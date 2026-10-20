
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/users";
const PAGE_SIZE = 5;

function App() {
  const [users, setUsers] = useState([]);
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
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      search,
      sortBy: sortField,
      order: sortDirection,
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    try {
      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();

    

      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError(error.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [search, sortField, sortDirection, page]);

  async function handleAddUser(event) {
    event.preventDefault();
    setFormError("");
    setFormMessage("");
    setAdding(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      

      setName("");
      setEmail("");
      setSearch("");
      setSortField("id");
      setSortDirection("asc");
      setPage(1);
      setFormMessage("User added successfully!");
      fetchUsers();
    } catch {
      setFormError("Could not connect to the server");
    } finally {
      setAdding(false);
    }
  }

  function startEditing(user) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditError("");
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    setEditError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
        }),
      });

      const data = await response.json();

     

      setEditingUser(null);
      fetchUsers();
    } catch {
      setEditError("Could not connect to the server");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "DELETE",
      });

      

      if (editingUser?.id === user.id) {
        setEditingUser(null);
      }

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers();
      }
    } catch {
      setError("Could not connect to the server");
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

  function sortLabel(field) {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  return (
    <main className="app">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage your users in one place.</p>
        </div>
      </header>

      <section className="add-user-section">
        <h2>Add User</h2>

        <form className="add-user-form" onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add User"}
          </button>
        </form>

        {formError && <p className="error">{formError}</p>}
        {formMessage && <p className="success">{formMessage}</p>}
      </section>

      {editingUser && (
        <section className="edit-user-section">
          <h2>Edit User #{editingUser.id}</h2>

          <form className="add-user-form" onSubmit={handleUpdateUser}>
            <input
              type="text"
              placeholder="Full name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
              required
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              disabled={saving}
            >
              Cancel
            </button>
          </form>

          {editError && <p className="error">{editError}</p>}
        </section>
      )}

      <section className="users-section">
        <div className="table-header">
          <div>
            <h2>All Users</h2>
            <p>{total} users found</p>
          </div>

          <input
            type="search"
            placeholder="Search name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <button className="sort-button" onClick={() => handleSort("id")}>
                    ID{sortLabel("id")}
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => handleSort("name")}>
                    Name{sortLabel("name")}
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => handleSort("email")}>
                    Email{sortLabel("email")}
                  </button>
                </th>
                <th>
                  <button className="sort-button" onClick={() => handleSort("createdAt")}>
                    Created At{sortLabel("createdAt")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => startEditing(user)}>Edit</button>{" "}
                      <button onClick={() => handleDeleteUser(user)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Page {page} of {totalPages || 1}
          </span>

          <div>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              Previous
            </button>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
