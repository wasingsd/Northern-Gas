const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.companyProfile.create({
    data: {
      nameEN: "NORTHERN INDUSTRIAL GAS CO.,LTD",
      nameTH: "บริษัท นอร์ทเธิร์น อินดัสเตรียลแก๊ส จำกัด",
      addressEN: "335 Moo.10 Tambol U-Mong, Amphur Muang, Lamphun",
      addressTH: "335 หมู่ 10, ต.อุโมงค์,  อ.เมืองลำพูน จังหวัดลำพูน 51150",
      tel1: "053-091234-5",
      tel2: "065-9983497",
      fax: "053-091236",
      email: "northgas335@gmail.com",
    }
  });
  console.log("Restored original company");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
