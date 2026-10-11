const prisma = require("../lib/prisma");

async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUserTasks(req, res, next) {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user.tasks);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserTasks
};