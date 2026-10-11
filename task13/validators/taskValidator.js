const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum([
    "pending",
    "in_progress",
    "completed"
  ]),
  userId: z.number().int().positive()
});

module.exports = taskSchema;
