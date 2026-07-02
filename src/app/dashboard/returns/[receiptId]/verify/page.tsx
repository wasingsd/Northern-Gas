import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import VerifyClient from "./VerifyClient";

export default async function VerifyReturnReceiptPage({ params }: { params: { receiptId: string } }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  if (!supabaseUser) redirect("/login");

  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: supabaseUser.email ?? "" },
      ],
    },
  });

  if (!admin) redirect("/login");

  const receipt = await prisma.returnReceipt.findUnique({
    where: { id: params.receiptId },
    include: {
      customer: true,
      items: { include: { cylinder: true } }
    }
  });

  if (!receipt) notFound();
  
  if (receipt.status === "COMPLETED") {
    // Already verified
    redirect("/dashboard/returns");
  }

  // Get all cylinders currently with this customer (in case admin scans something driver missed)
  const customerCylinders = await prisma.cylinder.findMany({
    where: {
      currentCustomerId: receipt.customerId,
      status: "WITH_CUSTOMER"
    },
    select: { id: true, cylinderNo: true }
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <VerifyClient 
        receipt={receipt} 
        customerCylinders={customerCylinders}
        adminId={admin.id}
      />
    </div>
  );
}
