const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Zoya",
      email: "zoya@example.com",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Anna",
      email: "anna@example.com",
    },
  });

  const backend = await prisma.category.create({
    data: {
      title: "Backend",
      description: "Backend development tasks",
    },
  });

  const database = await prisma.category.create({
    data: {
      title: "Database",
      description: "Database related tasks",
    },
  });

  const frontend = await prisma.category.create({
    data: {
      title: "Frontend",
      description: "Frontend development tasks",
    },
  });

  await prisma.task.create({
    data: {
      title: "Learn Express",
      description: "Practice Express REST API",
      status: "pending",
      userId: user1.id,
      categories: {
        connect: [
          { id: backend.id },
          { id: database.id },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Build API",
      description: "Create a REST API with Express",
      status: "in_progress",
      userId: user1.id,
      categories: {
        connect: [{ id: backend.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Learn SQL",
      description: "Practice SQL queries",
      status: "pending",
      userId: user2.id,
      categories: {
        connect: [{ id: database.id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: "Build React UI",
      description: "Create the task manager interface",
      status: "pending",
      userId: user2.id,
      categories: {
        connect: [{ id: frontend.id }],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });