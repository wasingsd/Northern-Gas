import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: 'file:./dev.db',
});

async function main() {
  console.log('Cleaning up existing data...');
  // Delete all to avoid unique constraint errors during re-seed
  await prisma.deliveryJob.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cylinderLog.deleteMany();
  await prisma.cylinder.deleteMany();
  await prisma.refillBatch.deleteMany();
  await prisma.gasProduct.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const hashedPassword = await bcrypt.hash('Admin9999', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'pluypt@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'OWNER',
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      email: 'driver1@gas-store.com',
      name: 'Somchai (Driver)',
      password: hashedPassword,
      role: 'DRIVER',
    },
  });

  console.log('Seeding Customers...');
  const customer1 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-001',
      name: 'ร้านอาหารเจ๊นก',
      phone: '0812345678',
      address: '123 ถ.สุขุมวิท กรุงเทพ',
      type: 'B2B',
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerCode: 'CUST-002',
      name: 'คุณสมชาย ใจดี',
      phone: '0898765432',
      address: '45/6 หมู่บ้านสิริ ถ.บางนา',
      type: 'GENERAL',
    }
  });

  console.log('Seeding Products...');
  const product4kg = await prisma.gasProduct.create({
    data: { name: 'แก๊ส ปตท. 4 กก.', sizeKg: 4, salePrice: 180, deliveryFee: 20 }
  });
  const product7kg = await prisma.gasProduct.create({
    data: { name: 'แก๊ส ปตท. 7 กก.', sizeKg: 7, salePrice: 250, deliveryFee: 20 }
  });
  const product15kg = await prisma.gasProduct.create({
    data: { name: 'แก๊ส ปตท. 15 กก.', sizeKg: 15, salePrice: 420, deliveryFee: 30 }
  });
  const product48kg = await prisma.gasProduct.create({
    data: { name: 'แก๊ส ปตท. 48 กก.', sizeKg: 48, salePrice: 1350, deliveryFee: 50 }
  });

  console.log('Seeding Cylinders...');
  const cyl1 = await prisma.cylinder.create({
    data: { assetCode: 'PTT-15-001', qrCode: 'QR-15-001', status: 'READY_TO_DISPATCH', productId: product15kg.id }
  });
  const cyl2 = await prisma.cylinder.create({
    data: { assetCode: 'PTT-15-002', qrCode: 'QR-15-002', status: 'WITH_CUSTOMER', currentCustomerId: customer1.id, productId: product15kg.id }
  });
  const cyl3 = await prisma.cylinder.create({
    data: { assetCode: 'PTT-4-001', qrCode: 'QR-4-001', status: 'READY_TO_DISPATCH', productId: product4kg.id }
  });

  console.log('Seeding Refill Batches...');
  const batch1 = await prisma.refillBatch.create({
    data: { batchNo: 'RB-2606-001', status: 'SENT' }
  });
  
  const cyl4 = await prisma.cylinder.create({
    data: { assetCode: 'PTT-15-003', qrCode: 'QR-15-003', status: 'IN_REFILL', refillBatchId: batch1.id, productId: product15kg.id }
  });

  console.log('Seeding Orders & Delivery Jobs...');
  const order1 = await prisma.order.create({
    data: {
      orderNo: 'ORD-2606-001',
      customerId: customer1.id,
      status: 'PROCESSING',
      totalAmount: 450,
      paymentStatus: 'UNPAID',
      items: {
        create: [
          { productId: product15kg.id, quantity: 1, unitPrice: 420, totalPrice: 450 }
        ]
      },
      deliveryJob: {
        create: {
          jobNo: 'DEL-2606-001',
          driverId: driver1.id,
          status: 'ASSIGNED',
          address: customer1.address
        }
      }
    }
  });

  await prisma.cylinder.update({
    where: { id: cyl1.id },
    data: { orderId: order1.id, status: 'READY_TO_DISPATCH' }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNo: 'ORD-2606-002',
      customerId: customer2.id,
      status: 'COMPLETED',
      totalAmount: 200,
      paymentStatus: 'PAID',
      items: {
        create: [
          { productId: product4kg.id, quantity: 1, unitPrice: 180, totalPrice: 200 }
        ]
      },
      deliveryJob: {
        create: {
          jobNo: 'DEL-2606-002',
          driverId: driver1.id,
          status: 'DELIVERED',
          address: customer2.address,
          deliveredAt: new Date()
        }
      }
    }
  });

  await prisma.cylinder.update({
    where: { id: cyl3.id },
    data: { orderId: order2.id, status: 'WITH_CUSTOMER', currentCustomerId: customer2.id }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
