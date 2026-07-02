const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.companyProfile.create({
    data: {
      nameEN: "MOCK GAS COMPANY LTD",
      nameTH: "บริษัท แก๊สจำลอง จำกัด",
      addressEN: "123 Mock Street",
      addressTH: "123 ถนนจำลอง",
      tel1: "053-999999",
    }
  });
  console.log("Created mock company");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
