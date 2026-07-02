const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.cylinder.findMany({where: {cylinderNo: {in: ["70-32456", "70-25668"]}}});
  console.log(c);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
