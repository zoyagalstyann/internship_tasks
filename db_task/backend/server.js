
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });

    res.json(departments);
  } catch (error) {
    console.error("Departments error:", error);
    res.status(500).json({ error: "Could not get departments" });
  }
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: "asc" },
    });

    res.json(projects);
  } catch (error) {
    console.error("Projects error:", error);
    res.status(500).json({ error: "Could not get projects" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);

    const allowedFields = ["id", "name", "email", "createdAt"];
    const sortBy = allowedFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "id";

    const order = req.query.order === "desc" ? "desc" : "asc";

    const where = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };

    const users = await prisma.user.findMany({
      where,
      include: {
        department: true,
        projects: true,
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Users error:", error);
    res.status(500).json({ error: "Could not get users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, departmentId, projectIds } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        departmentId: departmentId ? Number(departmentId) : null,
        projects: {
          connect: (projectIds || []).map((id) => ({
            id: Number(id),
          })),
        },
      },
      include: {
        department: true,
        projects: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "This email or project name already exists",
      });
    }

    res.status(400).json({ error: "Could not create user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { name, email, departmentId, projectIds } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const data = {
      name: name.trim(),
      email: email.trim(),
      departmentId: departmentId ? Number(departmentId) : null,
    };

    if (projectIds !== undefined) {
      data.projects = {
        set: projectIds.map((id) => ({ id: Number(id) })),
      };
    }

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
      include: {
        department: true,
        projects: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "This email already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(400).json({ error: "Could not update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(404).json({ error: "Could not delete user" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
