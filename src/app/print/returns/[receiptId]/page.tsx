import prisma from "@/lib/prisma";
import PrintTrigger from "../../orders/[orderId]/PrintTrigger";
import { notFound } from "next/navigation";

export default async function PrintReturnReceiptPage(props: { params: Promise<{ receiptId: string }> }) {
  const params = await props.params;
  const receiptId = params.receiptId;

  const receipt = await prisma.returnReceipt.findUnique({
    where: { id: receiptId },
    include: {
      customer: true,
      driver: true,
      items: {
        include: {
          cylinder: true
        }
      }
    }
  });

  if (!receipt) {
    return notFound();
  }

  const profile = await prisma.companyProfile.findFirst() || {
    nameEN: "NORTHERN INDUSTRIAL GAS CO.,LTD",
    nameTH: "บริษัท นอร์ทเธิร์น อินดัสเตรียลแก๊ส จำกัด",
    tel1: "053-091234-5",
    tel2: null
  };

  const dateStr = new Date(receipt.createdAt).toLocaleString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <>
      <PrintTrigger />
      <div style={{
        fontFamily: "'Sarabun', sans-serif",
        fontSize: "12px",
        color: "#000",
        width: "57mm",
        margin: "0 auto",
        padding: "0"
      }}>
        <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", marginBottom: "2px" }}>
          {profile.nameEN}
        </div>
        <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
          {profile.nameTH}
        </div>
        {profile.tel1 && <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "4px" }}>โทร: {profile.tel1} {profile.tel2 ? `, ${profile.tel2}` : ''}</div>}
        
        <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "8px" }}>CR - Cylinder Return</div>
        <div style={{ textAlign: "center" }}>ใบรับท่อแก๊สคืน (ชั่วคราว)</div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px" }}>วันที่พิมพ์: {dateStr}</div>
        <div style={{ marginBottom: "2px" }}>อ้างอิง: {receipt.receiptNo}</div>
        <div style={{ marginBottom: "2px" }}>พนักงานรับ: {receipt.driver?.name || "ยังไม่ระบุ"}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>ลูกค้า: {receipt.customer.customerCode || "ทั่วไป"}</div>
        <div style={{ marginBottom: "2px" }}>{receipt.customer.name}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ textAlign: "center", fontWeight: "bold" }}>รายการรับท่อเปล่าคืน</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "8px", padding: "0 4px" }}>
          {receipt.items.map((item, idx) => (
             <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
               <div>{idx + 1}. {item.cylinder.cylinderNo}</div>
               <div>1 ใบ</div>
             </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>รวมรับคืนทั้งหมด: {receipt.items.length} ใบ</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div>ลงชื่อลูกค้า (ผู้ส่งคืน)</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          
          <div style={{ marginTop: "15px" }}>ลงชื่อพนักงาน (ผู้รับคืน)</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          <div style={{ marginTop: "5px", marginBottom: "20px" }}>วันที่: ....../....../......</div>
        </div>
      </div>
    </>
  );
}
