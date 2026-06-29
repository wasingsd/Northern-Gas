import { User } from "lucide-react";
import CustomerForm from "../../CustomerForm";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!customer) return notFound();

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <User className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">แก้ไขข้อมูลลูกค้า</h2>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
        <CustomerForm initialData={customer} />
      </div>
    </div>
  );
}
