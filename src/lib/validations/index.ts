import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").optional().or(z.literal("")),
  role: z.enum(["OWNER", "DRIVER"]).default("DRIVER"),
});

export const CustomerSchema = z.object({
  customerCode: z.string().optional(),
  name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
});

export const GasProductSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อประเภทสินค้า"),
  size: z.string().min(1, "กรุณากรอกขนาดถัง"),
});

export const CylinderSchema = z.object({
  cylinderNo: z.string().min(1, "กรุณากรอกเลขตัวถัง"),
  qrCode: z.string().min(1, "กรุณากรอก/สแกน QR Code"),
  productId: z.string().min(1, "กรุณาเลือกประเภทถัง"),
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1, "กรุณาเลือกประเภทถัง"),
  quantity: z.number().int().positive("จำนวนต้องมากกว่า 0"),
  price: z.number().nonnegative("ราคาต้องไม่ติดลบ"),
});

export const OrderSchema = z.object({
  customerId: z.string().min(1, "กรุณาเลือกลูกค้า"),
  items: z.array(OrderItemSchema).min(1, "ต้องมีสินค้าอย่างน้อย 1 รายการ"),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  cylinderIds: z.array(z.string()).min(1, "ต้องเลือกถังอย่างน้อย 1 ใบ"),
});
