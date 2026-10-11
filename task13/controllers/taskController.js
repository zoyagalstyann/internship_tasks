const prisma = require("../lib/prisma");
const taskSchema = require("../validators/taskValidator");

async function getTasks(req, res, next) {
  try {
    const status = req.query.status;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (status) {
      const validStatuses = [
        "pending",
        "in_progress",
        "completed"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }
    }

    const where = status ? { status } : {};

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: true
      }
    });

    const total = await prisma.task.count({
      where
    });

    res.json({
      tasks,
      page,
      limit,
      total
    });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        categories: true
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const result = taskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid task data",
        errors: result.error.issues
      });
    }

    const newTask = await prisma.$transaction(async tx => {
      const task = await tx.task.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          status: result.data.status,
          userId: result.data.userId
        }
      });

      return task;
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const result = taskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid task data",
        errors: result.error.issues
      });
    }

    const id = Number(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        userId: result.data.userId
      }
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function updateTaskCategories(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({
        message: "categoryIds must be an array"
      });
    }

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        categories: {
          set: categoryIds.map(categoryId => ({
            id: categoryId
          }))
        }
      },
      include: {
        categories: true
      }
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCategories
};