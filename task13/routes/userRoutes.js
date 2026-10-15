
const express = require("express");
const {
  getUsers,
  getUserTasks
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id/tasks", getUserTasks);

module.exports = router;
