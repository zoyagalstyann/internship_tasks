
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const userRelations = {
  department: true,
  projects: true,
};

app.get("/users", async (req, res) => {
  try {
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order === "desc" ? "desc" : "asc";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 5)
    );

    const allowedFields = ["id", "name", "email", "createdAt"];

    if (!allowedFields.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }

    const where = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userRelations,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, departmentId, projectIds } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      (!Number.isInteger(Number(departmentId)) || Number(departmentId) < 1)
    ) {
      return res.status(400).json({ error: "Invalid departmentId" });
    }

    if (
      projectIds !== undefined &&
      (!Array.isArray(projectIds) ||
        !projectIds.every(
          (id) => Number.isInteger(Number(id)) && Number(id) > 0
        ))
    ) {
      return res.status(400).json({ error: "Invalid projectIds" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        ...(departmentId !== undefined && {
          departmentId:
            departmentId === null ? null : Number(departmentId),
        }),
        ...(projectIds !== undefined && {
          projects: {
            connect: projectIds.map((id) => ({ id: Number(id) })),
          },
        }),
      },
      include: userRelations,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "This email already exists",
      });
    }

    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(400).json({
        error: "Department or project was not found",
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, departmentId, projectIds } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    if (email !== undefined && !email.trim()) {
      return res.status(400).json({ error: "Email cannot be empty" });
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      (!Number.isInteger(Number(departmentId)) || Number(departmentId) < 1)
    ) {
      return res.status(400).json({ error: "Invalid departmentId" });
    }

    if (
      projectIds !== undefined &&
      (!Array.isArray(projectIds) ||
        !projectIds.every(
          (projectId) =>
            Number.isInteger(Number(projectId)) && Number(projectId) > 0
        ))
    ) {
      return res.status(400).json({ error: "Invalid projectIds" });
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    if (departmentId !== undefined) {
      data.departmentId =
        departmentId === null ? null : Number(departmentId);
    }

    if (projectIds !== undefined) {
      data.projects = {
        set: projectIds.map((projectId) => ({
          id: Number(projectId),
        })),
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: userRelations,
    });

    res.json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "This email already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User, department or project not found" });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Department was not found",
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
