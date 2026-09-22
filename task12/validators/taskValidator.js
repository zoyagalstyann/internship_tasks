const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum([
    "pending",
    "in-progress",
    "completed"
  ])
});

module.exports = taskSchema;