import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.badge.upsert({
    where: { key: "first_interview" },
    update: {},
    create: {
      key: "first_interview",
      name: "First Interview",
      description: "Completed the first HirePilot-AI interview.",
      xp: 100,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
