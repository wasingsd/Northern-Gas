import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import PrintTrigger from "../../orders/[orderId]/PrintTrigger";
import { notFound, redirect } from "next/navigation";

export default async function PrintReturnReceiptPage(props: { params: Promise<{ receiptId: string }> }) {
  const params = await props.params;
  const receiptId = params.receiptId;

  const receipt = await prisma.returnReceipt.findUnique({
    where: { id: receiptId },
    include: {
      customer: true,
      driver: true,
      vehicle: true,
      approvedBy: true,
      items: {
        include: {
          cylinder: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!receipt) {
    return notFound();
  }

  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  if (supabaseUser) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          { email: supabaseUser.email ?? "" },
        ],
      },
      select: { role: true },
    });
    
    if (dbUser?.role === "DRIVER" && receipt.status === "COMPLETED") {
      // Drivers cannot print completed receipts
      redirect("/dashboard/returns");
    }
  }

  // Group items by cylinder product name
  const groupedItems = receipt.items.reduce((acc, item) => {
    const productName = item.cylinder.product?.name || "ถังทั่วไป (ไม่ระบุประเภท)";
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(item);
    return acc;
  }, {} as Record<string, typeof receipt.items>);

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

  const printDateStr = new Date().toLocaleDateString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

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
        <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", marginBottom: "2px" }}>
          {profile.nameEN}
        </div>
        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>
          {profile.nameTH}
        </div>
        {profile.tel1 && <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "4px" }}>โทร: {profile.tel1} {profile.tel2 ? `, ${profile.tel2}` : ''}</div>}
        
        <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "8px" }}>CR - Cylinder Return</div>
        <div style={{ textAlign: "center" }}>ใบรับท่อแก๊สคืน {receipt.status === "COMPLETED" ? "(ตรวจสอบแล้ว)" : "(ชั่วคราว)"}</div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px" }}>วันที่: {dateStr}</div>
        <div style={{ marginBottom: "2px" }}>อ้างอิง: {receipt.receiptNo}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>ลูกค้า: {receipt.customer.name}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ textAlign: "center", fontWeight: "bold" }}>รายการรับท่อเปล่าคืน</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "8px", padding: "0 4px" }}>
          {Object.entries(groupedItems).map(([productName, items]) => (
            <div key={productName} style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", borderBottom: "1px dashed #ddd", marginBottom: "4px", paddingBottom: "2px" }}>
                {productName} 
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {items.map((item: any, idx: number) => (
                  <div key={item.id} style={{ fontSize: "12px", marginBottom: "2px" }}>
                    {idx + 1}. {item.cylinder.cylinderNo}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>รวมรับคืนทั้งหมด: {receipt.items.length} ใบ</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "12px", fontSize: "12px" }}>
          <div style={{ marginBottom: "2px" }}>พนักงานรับ: {receipt.driver?.name || "ยังไม่ระบุ"}</div>
          <div style={{ marginBottom: "2px" }}>ทะเบียนรถ: {receipt.vehicle?.registration || "-"}</div>
          {receipt.status === "COMPLETED" && (
            <div style={{ marginBottom: "2px", marginTop: "4px" }}>ผู้ตรวจสอบ: {receipt.approvedBy?.name || "-"}</div>
          )}
        </div>
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div>ลงชื่อลูกค้า (ผู้ส่งคืน)</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          
          <div style={{ marginTop: "15px" }}>ลงชื่อพนักงาน (ผู้รับคืน)</div>
          <br /><br />
          <div>........................................</div>
          <div style={{ marginTop: "5px" }}>(........................................)</div>
          <div style={{ marginTop: "5px", marginBottom: "20px" }}>วันที่: {printDateStr}</div>
        </div>
      </div>
    </>
  );
}
