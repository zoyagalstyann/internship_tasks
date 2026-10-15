
const express = require("express");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCategories
} = require("../controllers/taskController");

const router = express.Router();

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id/categories", updateTaskCategories);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
