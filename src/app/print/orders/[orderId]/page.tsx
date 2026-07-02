import prisma from "@/lib/prisma";
import PrintTrigger from "./PrintTrigger";
import { notFound } from "next/navigation";

export default async function PrintOrderPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  const orderId = params.orderId;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      cylinders: {
        include: { product: true }
      },
      deliveryJob: {
        include: { driver1: true, driver2: true, vehicle: true }
      }
    }
  });

  if (!order) {
    return notFound();
  }

  // Group cylinders by product name
  const groupedCylinders = order.cylinders.reduce((acc, cylinder) => {
    const productName = cylinder.product?.name || "ถังทั่วไป (ไม่ระบุประเภท)";
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(cylinder);
    return acc;
  }, {} as Record<string, typeof order.cylinders>);

  // Format Dates
  const dateStr = new Date(order.createdAt).toLocaleString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const printDateStr = new Date().toLocaleDateString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const profile = await prisma.companyProfile.findFirst() || {
    nameEN: "NORTHERN INDUSTRIAL GAS CO.,LTD",
    nameTH: "บริษัท นอร์ทเธิร์น อินดัสเตรียลแก๊ส จำกัด",
    tel1: "053-091234-5",
    tel2: null
  };

  return (
    <>
      <PrintTrigger />
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
        }
      `}} />
      <div style={{
        fontFamily: "'Sarabun', sans-serif",
        fontSize: "14px",
        color: "#000",
        width: "100%",
        maxWidth: "58mm",
        margin: "0 auto",
        padding: "0px"
      }}>
        <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", marginBottom: "2px", whiteSpace: "nowrap", transform: "scale(0.95)", transformOrigin: "center" }}>
          {profile.nameEN}
        </div>
        <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", marginBottom: "4px", whiteSpace: "nowrap", transform: "scale(0.9)", transformOrigin: "center" }}>
          {profile.nameTH}
        </div>
        {profile.tel1 && <div style={{ textAlign: "center", fontSize: "12px", marginBottom: "4px" }}>โทร: {profile.tel1} {profile.tel2 ? `, ${profile.tel2}` : ''}</div>}
        
        <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "8px" }}>CD - Cylinder Delivery</div>
        <div style={{ textAlign: "center" }}>ใบส่งท่อแก๊ส</div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0", marginTop: "12px" }}></div>
        <div style={{ marginBottom: "2px" }}>วันที่: {dateStr}</div>
        <div style={{ marginBottom: "2px" }}>เลขที่: {order.orderNo}</div>
        <div style={{ marginBottom: "2px" }}>DS: {order.deliveryJob?.jobNo || "-"}</div>
        <div style={{ marginBottom: "2px" }}>พนักงานส่ง 1: {order.deliveryJob?.driver1?.name || "ยังไม่ระบุ"}</div>
        <div style={{ marginBottom: "2px" }}>พนักงานส่ง 2: {order.deliveryJob?.driver2?.name || "ยังไม่ระบุ"}</div>
        <div style={{ marginBottom: "2px" }}>ทะเบียนรถ: {order.deliveryJob?.vehicle?.registration || "-"}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>ผู้รับ: {order.customer.name}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ textAlign: "center", fontWeight: "bold" }}>รายการสินค้า</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "8px", padding: "0 4px" }}>
          {Object.entries(groupedCylinders).map(([productName, cyls]) => (
            <div key={productName} style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", borderBottom: "1px dashed #ddd", marginBottom: "4px", paddingBottom: "2px" }}>
                {productName} 
              </div>
              {cyls.map((c: any, i: number) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <div>{i + 1}. {c.cylinderNo}</div>
                  <div>1 ใบ</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>รวมบาร์โค้ดทั้งหมด: {order.cylinders.length} บาร์โค้ด</div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>แยกตาม UOM: CYL = {order.cylinders.length}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div>ลงชื่อผู้รับสินค้า</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          <div style={{ marginTop: "5px" }}>วันที่: {printDateStr}</div>
        </div>
      </div>
    </>
  );
}
