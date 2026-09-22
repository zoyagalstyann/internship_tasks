const { readTasks, updateTasks } = require("../services/taskService");
const taskSchema = require("../validators/taskValidator");

async function getTasks(req, res, next) {
  try {
    let tasks = await readTasks();

    const status = req.query.status;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (status) {
      const validStatuses = [
        "pending",
        "in-progress",
        "completed"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }

      tasks = tasks.filter(task => task.status === status);
    }

    const start = (page - 1) * limit;
    const paginatedTasks = tasks.slice(start, start + limit);

    res.json({
      tasks: paginatedTasks,
      page,
      limit,
      total: tasks.length
    });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const tasks = await readTasks();

    const task = tasks.find(
      task => task.id === Number(req.params.id)
    );

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

    let newTask;

    await updateTasks(async tasks => {
      newTask = {
        id: tasks.length === 0
          ? 1
          : Math.max(...tasks.map(task => task.id)) + 1,
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        createdAt: new Date().toISOString()
      };

      tasks.push(newTask);

      return tasks;
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
    let updatedTask;

    await updateTasks(async tasks => {
      const task = tasks.find(task => task.id === id);

      if (!task) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }

      task.title = result.data.title;
      task.description = result.data.description;
      task.status = result.data.status;

      updatedTask = task;

      return tasks;
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = Number(req.params.id);

    await updateTasks(async tasks => {
      const taskExists = tasks.some(task => task.id === id);

      if (!taskExists) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }

      return tasks.filter(task => task.id !== id);
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};