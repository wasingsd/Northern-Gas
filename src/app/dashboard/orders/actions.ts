"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

export async function createOrderAction(formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const customerTaxType = formData.get("customerTaxType") as string;
  const customerTaxId = formData.get("customerTaxId") as string;
  const customerBranchName = formData.get("customerBranchName") as string;
  const customerBranchNo = formData.get("customerBranchNo") as string;
  const customerCode = formData.get("customerCode") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const customerAddress = formData.get("customerAddress") as string;
  
  const cylinderIdsJson = formData.get("cylinderIds") as string;
  let cylinderIds: string[] = [];
  try {
    cylinderIds = JSON.parse(cylinderIdsJson);
  } catch (e) {
    throw new Error("Invalid cylinder data");
  }
  
  if (!customerName || cylinderIds.length === 0) {
    throw new Error("Missing required fields");
  }

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: { name: customerName }
  });

  const customerDataToUpdate = {
    ...(customerTaxType ? { taxType: customerTaxType } : {}),
    ...(customerTaxId ? { taxId: customerTaxId } : {}),
    ...(customerBranchName ? { branchName: customerBranchName } : {}),
    ...(customerBranchNo ? { branchNo: customerBranchNo } : {}),
    ...(customerCode ? { customerCode: customerCode } : {}),
    ...(customerPhone ? { phone: customerPhone } : {}),
    ...(customerEmail ? { email: customerEmail } : {}),
    ...(customerAddress ? { address: customerAddress } : {})
  };

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: customerName,
        ...customerDataToUpdate
      }
    });
  } else if (Object.keys(customerDataToUpdate).length > 0) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: customerDataToUpdate
    });
  }

  // Create Order and DeliveryJob
  const orderNo = `DSP-${Date.now().toString().slice(-6)}`; // Dispatch number
  const jobNo = `JOB-${Date.now().toString().slice(-6)}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId: customer.id,
      status: "PENDING",
      deliveryJob: {
        create: {
          jobNo,
          status: "WAITING",
          address: customer.address || "รับที่ร้าน"
        }
      }
    }
  });

  // Update Cylinders with Order ID and change status
  await prisma.cylinder.updateMany({
    where: { id: { in: cylinderIds } },
    data: {
      orderId: order.id,
      status: "READY_TO_DISPATCH"
    }
  });

  // Log the cylinder movements
  const logs = cylinderIds.map(cId => ({
    cylinderId: cId,
    status: "READY_TO_DISPATCH",
    notes: `บันทึกรายการส่งถัง ${orderNo}`
  }));
  
  await prisma.cylinderLog.createMany({
    data: logs
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/dispatch");
  redirect("/dashboard/orders");
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const customerTaxType = formData.get("customerTaxType") as string;
  const customerTaxId = formData.get("customerTaxId") as string;
  const customerBranchName = formData.get("customerBranchName") as string;
  const customerBranchNo = formData.get("customerBranchNo") as string;
  const customerCode = formData.get("customerCode") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const customerAddress = formData.get("customerAddress") as string;
  
  const cylinderIdsJson = formData.get("cylinderIds") as string;
  let cylinderIds: string[] = [];
  try {
    cylinderIds = JSON.parse(cylinderIdsJson);
  } catch (e) {
    throw new Error("Invalid cylinder data");
  }
  
  if (!customerName || cylinderIds.length === 0) {
    throw new Error("Missing required fields");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, cylinders: true }
  });

  if (!order) throw new Error("Order not found");

  const customerDataToUpdate = {
    name: customerName,
    ...(customerTaxType ? { taxType: customerTaxType } : {}),
    ...(customerTaxId ? { taxId: customerTaxId } : {}),
    ...(customerBranchName ? { branchName: customerBranchName } : {}),
    ...(customerBranchNo ? { branchNo: customerBranchNo } : {}),
    ...(customerCode ? { customerCode: customerCode } : {}),
    ...(customerPhone ? { phone: customerPhone } : {}),
    ...(customerEmail ? { email: customerEmail } : {}),
    ...(customerAddress ? { address: customerAddress } : {})
  };

  await prisma.customer.update({
    where: { id: order.customerId },
    data: customerDataToUpdate
  });

  // Reset old cylinders
  if (order.cylinders && order.cylinders.length > 0) {
    await prisma.cylinder.updateMany({
      where: { orderId: order.id },
      data: { orderId: null, status: "READY_TO_DISPATCH" }
    });
  }

  // Update Cylinders with Order ID and change status
  await prisma.cylinder.updateMany({
    where: { id: { in: cylinderIds } },
    data: {
      orderId: order.id,
      status: "READY_TO_DISPATCH"
    }
  });

  // Log the cylinder movements
  const logs = cylinderIds.map(cId => ({
    cylinderId: cId,
    status: "READY_TO_DISPATCH",
    notes: `แก้ไขรายการส่งถัง (${order.orderNo})`
  }));
  
  await prisma.cylinderLog.createMany({
    data: logs
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  redirect(`/dashboard/orders/${order.id}`);
}
