const fs = require("fs/promises");

async function readTasks() {
  try {
    const data = await fs.readFile("data/tasks.json", "utf-8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir("data", { recursive: true });
      await fs.writeFile("data/tasks.json", "[]");
      return [];
    }

    throw error;
  }
}

let writeQueue = Promise.resolve();

function updateTasks(updateFunction) {
  writeQueue = writeQueue.then(async () => {
    const tasks = await readTasks();

    const updatedTasks = await updateFunction(tasks);

    await fs.writeFile(
      "data/tasks.json",
      JSON.stringify(updatedTasks, null, 2)
    );

    return updatedTasks;
  });

  return writeQueue;
}

module.exports = {
  readTasks,
  updateTasks
};