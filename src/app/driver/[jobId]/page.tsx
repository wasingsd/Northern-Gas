import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Package, Navigation } from "lucide-react";
import { notFound } from "next/navigation";
import DriverActionButtons from "./DriverActionButtons";

const prisma = new PrismaClient();

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          customer: true,
          items: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!job) return notFound();

  const customer = job.order.customer;
  const isMyJob = job.status === "OUT_FOR_DELIVERY";

  return (
    <div className="space-y-6 pt-2 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/driver" className="flex items-center justify-center h-10 w-10 bg-gray-800/50 backdrop-blur-md rounded-full shadow-sm border border-gray-700/50 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">รายละเอียดงาน</h2>
      </div>

      <div className="bg-gradient-to-b from-gray-800/80 to-gray-800/40 rounded-3xl border border-gray-700/50 shadow-lg shadow-black/20 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-white leading-tight">{customer.name}</h3>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm font-mono text-gray-400">ID: {job.jobNo}</p>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isMyJob ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-orange-500/20 text-orange-400 border-orange-500/20'}`}>
              {isMyJob ? 'กำลังจัดส่ง' : 'รอดำเนินการ'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Address */}
          <div className="flex gap-4">
            <div className="bg-gray-700/50 p-3 rounded-2xl h-fit shadow-inner">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">สถานที่ส่ง</p>
              <p className="text-gray-200 leading-relaxed">{job.address}</p>
            </div>
          </div>

          {/* Contact */}
          {customer.phone && (
            <div className="flex gap-4">
              <div className="bg-gray-700/50 p-3 rounded-2xl h-fit shadow-inner">
                <Phone className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">เบอร์ติดต่อ</p>
                <a href={`tel:${customer.phone}`} className="text-lg font-medium text-blue-400">
                  {customer.phone}
                </a>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="border-t border-gray-700/50 pt-6">
            <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> รายการสินค้า
            </p>
            <div className="space-y-4">
              {job.order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-2xl border border-gray-700/30">
                  <span className="text-gray-200 font-medium">{item.product.name} <span className="text-gray-500 ml-1">x{item.quantity}</span></span>
                  <span className="font-bold text-white">฿{item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-700/50 pt-6 flex justify-between items-end">
            <span className="font-bold text-gray-400">ยอดเก็บเงินรวม</span>
            <span className="text-3xl font-bold text-white tracking-tight">฿{job.order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address || '')}`}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 bg-gray-800/80 hover:bg-gray-700 text-blue-400 rounded-2xl font-bold transition-colors border border-gray-700/50 shadow-lg"
        >
          <Navigation className="h-5 w-5" />
          เปิดแผนที่นำทาง
        </a>

        <DriverActionButtons jobId={job.id} status={job.status} />
      </div>
    </div>
  );
}
