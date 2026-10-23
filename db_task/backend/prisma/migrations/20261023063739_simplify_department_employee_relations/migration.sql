/*
  Warnings:

  - You are about to drop the `_DepartmentMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DepartmentMembers" DROP CONSTRAINT "_DepartmentMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_DepartmentMembers" DROP CONSTRAINT "_DepartmentMembers_B_fkey";

-- DropTable
DROP TABLE "_DepartmentMembers";

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeProjects" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmployeeProjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmployeeProjects_B_index" ON "_EmployeeProjects"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeProjects" ADD CONSTRAINT "_EmployeeProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeProjects" ADD CONSTRAINT "_EmployeeProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
