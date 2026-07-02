import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import ReturnsClient from "./ReturnsClient";

export default async function ReturnsPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  let user = null;
  if (supabaseUser) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
    });
  }
  
  // Fetch active customers
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" }
  });

  // Fetch all cylinders currently with customers
  const withCustomerCylinders = await prisma.cylinder.findMany({
    where: { status: "WITH_CUSTOMER" },
    include: { 
      product: true,
      order: { select: { companyProfileId: true } }
    }
  });

  const vehicles = await prisma.vehicle.findMany({ orderBy: { registration: "asc" } });
  const companyProfiles = await prisma.companyProfile.findMany({ orderBy: { createdAt: "asc" } });

  // Convert to plain object safely
  const plainCustomers = JSON.parse(JSON.stringify(customers));
  const plainCylinders = JSON.parse(JSON.stringify(withCustomerCylinders));
  const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;
  const plainCompanyProfiles = JSON.parse(JSON.stringify(companyProfiles));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ระบบรับถังเปล่าคืน (Return)</h2>
          <p className="text-sm text-gray-500">สแกนถังเปล่าที่รับคืนจากลูกค้าเพื่อนำกลับเข้าคลังและออกใบรับถัง</p>
        </div>
      </div>
      
      <ReturnsClient 
          customers={plainCustomers} 
          withCustomerCylinders={plainCylinders}
          currentUser={plainUser}
          vehicles={vehicles}
          companyProfiles={plainCompanyProfiles}
        />
    </div>
  );
}
