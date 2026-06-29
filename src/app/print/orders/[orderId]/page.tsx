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
      cylinders: true,
      deliveryJob: {
        include: { driver: true }
      }
    }
  });

  if (!order) {
    return notFound();
  }

  // Format Date
  const dateStr = new Date(order.createdAt).toLocaleString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Group cylinders by cylinderCode (or fallback)
  const groupedCylinders = order.cylinders.reduce((acc: any, cyl: any) => {
    const code = cyl.cylinderCode || "ทั่วไป";
    if (!acc[code]) acc[code] = [];
    acc[code].push(cyl);
    return acc;
  }, {});

  return (
    <>
      <PrintTrigger />
      <div style={{
        fontFamily: "'Sarabun', sans-serif",
        fontSize: "12px",
        color: "#000",
        width: "48mm",
        margin: "0 auto",
        padding: "0"
      }}>
        <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
          Thai Special Gas Co.,Ltd
        </div>
        <div style={{ textAlign: "center", fontWeight: "bold" }}>CD - Cylinder Delivery</div>
        <div style={{ textAlign: "center" }}>ใบส่งท่อแก๊ส</div>
        
        <div style={{ textAlign: "center", margin: "8px 0" }}>[ QR CODE ]</div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px" }}>สาขา: 1 : Pathumthani</div>
        <div style={{ marginBottom: "2px" }}>วันที่: {dateStr}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px" }}>เลขที่: {order.orderNo}</div>
        <div style={{ marginBottom: "2px" }}>DS: {order.deliveryJob?.jobNo || "-"}</div>
        <div style={{ marginBottom: "2px" }}>จุดส่งสินค้า: 1</div>
        <div style={{ marginBottom: "2px" }}>พนักงานส่ง: {order.deliveryJob?.driver?.name || "ยังไม่ระบุ"}</div>
        <div style={{ marginBottom: "2px" }}>ที่อยู่: {order.customer.address || "-"}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>ผู้รับ: {order.customer.customerCode || "ทั่วไป"}</div>
        <div style={{ marginBottom: "2px" }}>{order.customer.name}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ textAlign: "center", fontWeight: "bold" }}>รายการสินค้า</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        {Object.entries(groupedCylinders).map(([code, cyls]: [string, any], index) => (
          <div key={code} style={{ marginTop: "8px" }}>
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>{index + 1}. {code}</div>
            <div style={{ fontSize: "11px", marginBottom: "2px" }}>ท่อแก๊ส</div>
            <div style={{ fontWeight: "bold", textAlign: "right", marginBottom: "4px" }}>
              จำนวน: {cyls.length} ใบ
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
              fontSize: "10px",
              paddingLeft: "8px"
            }}>
              {cyls.map((c: any, i: number) => (
                <div key={c.id}>{i + 1}. {c.cylinderNo}</div>
              ))}
            </div>
          </div>
        ))}
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>รวมบาร์โค้ดทั้งหมด: {order.cylinders.length} บาร์โค้ด</div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>แยกตาม UOM: CYL = {order.cylinders.length}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div>ลงชื่อผู้รับสินค้า</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          <div style={{ marginTop: "5px" }}>วันที่: ....../....../......</div>
        </div>
      </div>
    </>
  );
}
