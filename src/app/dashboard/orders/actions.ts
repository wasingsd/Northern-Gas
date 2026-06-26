"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

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

  // Calculate order items from cylinders
  const cylinders = await prisma.cylinder.findMany({
    where: { id: { in: cylinderIds } },
    include: { product: true }
  });

  let totalPrice = 0;
  const orderItemsMap = new Map<string, { productId: string, quantity: number, unitPrice: number, totalPrice: number }>();
  
  for (const cylinder of cylinders) {
     const product = cylinder.product;
     if (product) {
        totalPrice += product.salePrice + product.deliveryFee;
        
        const existing = orderItemsMap.get(product.id);
        if (existing) {
           existing.quantity += 1;
           existing.totalPrice += product.salePrice;
        } else {
           orderItemsMap.set(product.id, {
             productId: product.id,
             quantity: 1,
             unitPrice: product.salePrice,
             totalPrice: product.salePrice
           });
        }
     }
  }

  const orderItemsData = Array.from(orderItemsMap.values());
  if (orderItemsData.length === 0) throw new Error("No valid products found for the scanned cylinders");

  // Create Order, OrderItem, and DeliveryJob
  const orderNo = `ORD-${Date.now().toString().slice(-6)}`;
  const jobNo = `JOB-${Date.now().toString().slice(-6)}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId: customer.id,
      totalAmount: totalPrice,
      status: "PENDING",
      paymentStatus: "UNPAID",
      items: {
        create: orderItemsData
      },
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
    notes: `เตรียมจัดส่งสำหรับออเดอร์ ${orderNo}`
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

  // Calculate order items from cylinders
  const cylinders = await prisma.cylinder.findMany({
    where: { id: { in: cylinderIds } },
    include: { product: true }
  });

  let totalPrice = 0;
  const orderItemsMap = new Map<string, { productId: string, quantity: number, unitPrice: number, totalPrice: number }>();
  
  for (const cylinder of cylinders) {
     const product = cylinder.product;
     if (product) {
        totalPrice += product.salePrice + product.deliveryFee;
        
        const existing = orderItemsMap.get(product.id);
        if (existing) {
           existing.quantity += 1;
           existing.totalPrice += product.salePrice;
        } else {
           orderItemsMap.set(product.id, {
             productId: product.id,
             quantity: 1,
             unitPrice: product.salePrice,
             totalPrice: product.salePrice
           });
        }
     }
  }

  const orderItemsData = Array.from(orderItemsMap.values());
  if (orderItemsData.length === 0) throw new Error("No valid products found for the scanned cylinders");

  // Reset old cylinders
  if (order.cylinders && order.cylinders.length > 0) {
    await prisma.cylinder.updateMany({
      where: { orderId: order.id },
      data: { orderId: null, status: "READY_TO_DISPATCH" }
    });
  }

  // Delete existing items
  await prisma.orderItem.deleteMany({
    where: { orderId: order.id }
  });

  // Create new items and update total
  await prisma.order.update({
    where: { id: order.id },
    data: {
      totalAmount: totalPrice,
      items: {
        create: orderItemsData
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
    notes: `แก้ไขออเดอร์ (เตรียมจัดส่งสำหรับออเดอร์ ${order.orderNo})`
  }));
  
  await prisma.cylinderLog.createMany({
    data: logs
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${order.id}`);
  redirect(`/dashboard/orders/${order.id}`);
}
