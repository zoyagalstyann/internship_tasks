
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get("/users", async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const sortBy = req.query.sortBy || "id";
    const order = req.query.order || "asc";

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
    res.status(500).json({ error: "Could not get users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, departmentId, projectIds } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        departmentId: departmentId || null,
        projects: {
          connect: (projectIds || []).map((id) => ({ id: Number(id) })),
        },
      },
      include: {
        department: true,
        projects: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Could not create user" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { name, email, departmentId, projectIds } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        email,
        departmentId: departmentId || null,
        ...(projectIds !== undefined && {
          projects: {
            set: projectIds.map((id) => ({ id: Number(id) })),
          },
        }),
      },
      include: {
        department: true,
        projects: true,
      },
    });

    res.json(user);
  } catch (error) {
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
    res.status(404).json({ error: "Could not delete user" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
