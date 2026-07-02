"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateOrderSchema } from "@/lib/validations";

export async function createOrderAction(formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const customerCode = formData.get("customerCode") as string;
  const vehicleId = formData.get("vehicleId") as string;
  const driver1Id = formData.get("driver1Id") as string;
  const driver2Id = formData.get("driver2Id") as string;
  
  const cylinderIdsJson = formData.get("cylinderIds") as string;
  let cylinderIds: string[] = [];
  try {
    cylinderIds = JSON.parse(cylinderIdsJson);
  } catch (e) {
    throw new Error("Invalid cylinder data");
  }
  
  const parsed = CreateOrderSchema.safeParse({ customerName, cylinderIds });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: { name: customerName }
  });

  const customerDataToUpdate = {
    ...(customerCode ? { customerCode: customerCode } : {})
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

  // Generate ID with format YYMMDDxxx
  const now = new Date();
  
  // Create start/end of day safely in local time
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const year = now.getFullYear().toString().slice(-2); // 24
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  const lastOrder = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let nextSeq = 1;
  if (lastOrder && lastOrder.orderNo) {
    const match = lastOrder.orderNo.match(/(\d{3})$/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const seqStr = nextSeq.toString().padStart(3, '0');
  const orderNo = `DSP-${datePrefix}${seqStr}`; 
  const jobNo = `JOB-${datePrefix}${seqStr}`;

  // Group selected cylinders by productId to create OrderItems
  const selectedCylinders = await prisma.cylinder.findMany({ where: { id: { in: cylinderIds } } });
  const productCounts: Record<string, number> = {};
  for (const c of selectedCylinders) {
    if (c.productId) {
      productCounts[c.productId] = (productCounts[c.productId] || 0) + 1;
    }
  }
  const orderItemsData = Object.entries(productCounts).map(([productId, quantity]) => ({
    productId,
    quantity
  }));

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId: customer.id,
      status: "PENDING",
      deliveryJob: {
        create: {
          jobNo,
          status: "WAITING",
          address: "รับที่ร้าน",
          ...(vehicleId ? { vehicleId } : {}),
          ...(driver1Id ? { driver1Id } : {}),
          ...(driver2Id ? { driver2Id } : {})
        }
      },
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
    notes: `บันทึกรายการส่งถัง ${orderNo}`
  }));
  
  await prisma.cylinderLog.createMany({
    data: logs
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/dispatch");
  return { success: true, redirectTo: "/dashboard/orders" };
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const customerCode = formData.get("customerCode") as string;
  const vehicleId = formData.get("vehicleId") as string;
  const driver1Id = formData.get("driver1Id") as string;
  const driver2Id = formData.get("driver2Id") as string;
  
  const cylinderIdsJson = formData.get("cylinderIds") as string;
  let cylinderIds: string[] = [];
  try {
    cylinderIds = JSON.parse(cylinderIdsJson);
  } catch (e) {
    throw new Error("Invalid cylinder data");
  }
  
  const parsed = CreateOrderSchema.safeParse({ customerName, cylinderIds });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, cylinders: true }
  });

  if (!order) throw new Error("Order not found");

  const customerDataToUpdate = {
    name: customerName,
    ...(customerCode ? { customerCode: customerCode } : {})
  };

  await prisma.customer.update({
    where: { id: order.customerId },
    data: customerDataToUpdate
  });

  const deliveryJob = await prisma.deliveryJob.findUnique({ where: { orderId: order.id } });
  if (deliveryJob) {
    await prisma.deliveryJob.update({
      where: { id: deliveryJob.id },
      data: { 
        vehicleId: vehicleId || null,
        driver1Id: driver1Id || null,
        driver2Id: driver2Id || null
      }
    });
  }

  // Reset old cylinders
  if (order.cylinders && order.cylinders.length > 0) {
    await prisma.cylinder.updateMany({
      where: { orderId: order.id },
      data: { orderId: null, status: "READY_TO_DISPATCH" }
    });
  }

  // Delete old order items
  await prisma.orderItem.deleteMany({
    where: { orderId: order.id }
  });

  // Group new cylinders by productId to create new OrderItems
  const selectedCylinders = await prisma.cylinder.findMany({ where: { id: { in: cylinderIds } } });
  const productCounts: Record<string, number> = {};
  for (const c of selectedCylinders) {
    if (c.productId) {
      productCounts[c.productId] = (productCounts[c.productId] || 0) + 1;
    }
  }
  const orderItemsData = Object.entries(productCounts).map(([productId, quantity]) => ({
    orderId: order.id,
    productId,
    quantity
  }));
  
  if (orderItemsData.length > 0) {
    await prisma.orderItem.createMany({
      data: orderItemsData
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
  return { success: true, redirectTo: `/dashboard/orders/${order.id}` };
}

export async function markOrderAsReadyAction(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new Error("Order not found");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "READY_FOR_DISPATCH" }
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/dispatch");
}

export async function cancelOrderAction(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { cylinders: true }
  });

  if (!order) throw new Error("ไม่พบรายการส่งถัง");
  if (order.status !== "PENDING") throw new Error("ไม่สามารถยกเลิกรายการที่กำลังจัดส่งหรือจัดส่งแล้วได้");

  // Reset cylinders back to stock
  if (order.cylinders && order.cylinders.length > 0) {
    const cylinderIds = order.cylinders.map(c => c.id);
    await prisma.cylinder.updateMany({
      where: { orderId: orderId },
      data: { orderId: null, status: "READY_TO_DISPATCH" }
    });

    const logs = cylinderIds.map(cId => ({
      cylinderId: cId,
      status: "READY_TO_DISPATCH",
      notes: `ยกเลิกรายการส่งถัง (${order.orderNo})`
    }));
    await prisma.cylinderLog.createMany({ data: logs });
  }

  // Delete the order (this will cascade delete the DeliveryJob)
  await prisma.order.delete({
    where: { id: orderId }
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/dispatch");
}
