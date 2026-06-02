import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { MapPin, Info, Navigation2, CheckCircle2, Clock } from "lucide-react";

const prisma = new PrismaClient();

export default async function DriverJobsPage() {
  // Get jobs that are WAITING or OUT_FOR_DELIVERY
  const jobs = await prisma.deliveryJob.findMany({
    where: {
      status: { in: ["WAITING", "OUT_FOR_DELIVERY"] }
    },
    include: {
      order: {
        include: {
          customer: true,
          items: {
            include: { product: true }
          }
        }
      }
    },
    orderBy: [
      { status: 'desc' }, // OUT_FOR_DELIVERY first
      { createdAt: 'asc' }
    ]
  });

  const waitingJobs = jobs.filter(j => j.status === "WAITING");
  const myJobs = jobs.filter(j => j.status === "OUT_FOR_DELIVERY");

  return (
    <div className="space-y-6 pt-2">
      {/* My Current Jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Active Deliveries ({myJobs.length})
          </h2>
        </div>
        
        {myJobs.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center text-gray-500 border border-gray-700/50 shadow-inner">
            ไม่มีงานที่กำลังจัดส่ง
          </div>
        ) : (
          <div className="space-y-4">
            {myJobs.map(job => (
              <JobCard key={job.id} job={job} isMyJob={true} />
            ))}
          </div>
        )}
      </section>

      {/* Available Jobs */}
      <section className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Pending Orders ({waitingJobs.length})
          </h2>
        </div>
        
        {waitingJobs.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center text-gray-500 border border-gray-700/50 shadow-inner">
            ไม่มีงานรอดำเนินการ
          </div>
        ) : (
          <div className="space-y-4">
            {waitingJobs.map(job => (
              <JobCard key={job.id} job={job} isMyJob={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JobCard({ job, isMyJob }: { job: any, isMyJob: boolean }) {
  const customer = job.order.customer;
  const itemCount = job.order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className={`relative overflow-hidden rounded-3xl p-5 ${
      isMyJob 
        ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-blue-900/20' 
        : 'bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700/50 shadow-lg shadow-black/20'
    } backdrop-blur-xl transition-transform active:scale-[0.98]`}>
      
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {isMyJob ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Delivering
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold tracking-wide uppercase border border-orange-500/20">
              <Clock className="h-3 w-3" />
              Pending
            </span>
          )}
          <span className="text-xs text-gray-500 font-mono">{job.jobNo}</span>
        </div>
        <button className="h-8 w-8 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Customer Info */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{customer.name}</h3>
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-snug">{job.address}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isMyJob ? (
          <>
            <Link href={`/driver/${job.id}`} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-colors">
              <CheckCircle2 className="h-5 w-5" />
              ปิดงาน
            </Link>
            <button className="px-5 bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 rounded-2xl flex items-center justify-center transition-colors">
              <Navigation2 className="h-5 w-5" />
            </button>
          </>
        ) : (
          <Link href={`/driver/${job.id}`} className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-gray-600/50">
            ดูรายละเอียด
          </Link>
        )}
      </div>

      {/* Decorative Blur Elements */}
      {isMyJob && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        </>
      )}
    </div>
  );
}
