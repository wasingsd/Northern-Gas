import prisma from "@/lib/prisma";
import PrintTrigger from "../../orders/[orderId]/PrintTrigger";
import { notFound } from "next/navigation";

export default async function PrintDeliveryReceiptPage(props: { params: Promise<{ receiptId: string }> }) {
  const params = await props.params;
  const receiptId = params.receiptId;

  const receipt = await prisma.deliveryReceipt.findUnique({
    where: { id: receiptId },
    include: {
      deliveryJob: {
        include: {
          order: {
            include: { customer: true, companyProfile: true }
          },
          driver1: true,
          driver2: true,
          vehicle: true
        }
      },
      deliveredBy: true,
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

  // Group items by cylinder product name
  const groupedCylinders = receipt.items.reduce((acc, item) => {
    const productName = item.cylinder.product?.name || "ถังทั่วไป (ไม่ระบุประเภท)";
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(item.cylinder);
    return acc;
  }, {} as Record<string, any[]>);

  // Format Dates
  const dateStr = new Date(receipt.createdAt).toLocaleString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const printDateStr = new Date().toLocaleDateString("th-TH", {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const profile = receipt.deliveryJob.order.companyProfile || await prisma.companyProfile.findFirst({ orderBy: { createdAt: 'asc' } }) || {
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
        <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", marginBottom: "2px", whiteSpace: "nowrap" }}>
          {profile.nameEN}
        </div>
        <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>
          {profile.nameTH}
        </div>
        {profile.tel1 && <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "4px" }}>โทร: {profile.tel1} {profile.tel2 ? `, ${profile.tel2}` : ''}</div>}
        
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11px", marginTop: "8px" }}>CD - Cylinder Delivery</div>
        <div style={{ textAlign: "center", fontSize: "11px" }}>ใบรับสินค้า</div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0", marginTop: "12px" }}></div>
        <div style={{ marginBottom: "2px" }}>วันที่: {dateStr}</div>
        <div style={{ marginBottom: "2px" }}>เลขที่: {receipt.receiptNo}</div>
        {receipt.deliveryJob.order.invoiceNo && (
          <div style={{ marginBottom: "2px" }}>อ้างอิง: {receipt.deliveryJob.order.invoiceNo}</div>
        )}
        <div style={{ marginBottom: "2px" }}>DS: {receipt.deliveryJob.jobNo}</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>ลูกค้า: {receipt.deliveryJob.order.customer.name}</div>
        {receipt.deliveryJob.address && receipt.deliveryJob.address !== "รับที่ร้าน" && (
          <div style={{ marginBottom: "2px", fontSize: "13px" }}>จุดส่ง: {receipt.deliveryJob.address}</div>
        )}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ textAlign: "center", fontWeight: "bold" }}>รายการสินค้า (ที่ส่งจริง)</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "8px", padding: "0 4px" }}>
          {Object.entries(groupedCylinders).map(([productName, cyls]) => (
            <div key={productName} style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", borderBottom: "1px dashed #ddd", marginBottom: "4px", paddingBottom: "2px" }}>
                {productName} 
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {cyls.map((c: any, i: number) => (
                  <div key={c.id} style={{ fontSize: "12px", marginBottom: "2px" }}>
                    {i + 1}. {c.cylinderNo}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        <div style={{ marginBottom: "2px", fontWeight: "bold" }}>รวมบาร์โค้ดทั้งหมด: {receipt.items.length} บาร์โค้ด</div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>
        
        <div style={{ marginTop: "12px", fontSize: "12px" }}>
          <div style={{ marginBottom: "2px" }}>พนักงานส่ง 1: {receipt.deliveryJob.driver1?.name || "ยังไม่ระบุ"}</div>
          <div style={{ marginBottom: "2px" }}>พนักงานส่ง 2: {receipt.deliveryJob.driver2?.name || "ยังไม่ระบุ"}</div>
          <div style={{ marginBottom: "2px" }}>ทะเบียนรถ: {receipt.deliveryJob.vehicle?.registration || "-"}</div>
        </div>
        
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
