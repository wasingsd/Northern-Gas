"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, Trash2, Package } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sizeKg: number;
  salePrice: number;
  deliveryFee: number;
};

type Cylinder = {
  id: string;
  assetCode: string;
  qrCode: string;
  status: string;
  productId: string | null;
  product: Product | null;
};

export default function OrderItemsForm({ products, cylinders, initialItems }: { products: any[], cylinders: any[], initialItems?: any[] }) {
  const [scannedCylinders, setScannedCylinders] = useState<Cylinder[]>(initialItems || []);
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = inputValue.trim();
      if (!code) return;

      // Find cylinder by qrCode or assetCode
      const foundCylinder = cylinders.find(c => c.qrCode === code || c.assetCode === code);

      if (!foundCylinder) {
        setErrorMsg(`ไม่พบถังแก๊สที่มีรหัส: ${code}`);
        setInputValue("");
        return;
      }

      if (!foundCylinder.product) {
        setErrorMsg(`ถังแก๊สรหัส ${code} ยังไม่ได้ระบุประเภทสินค้า`);
        setInputValue("");
        return;
      }

      if (foundCylinder.status === 'WITH_CUSTOMER') {
        // Technically can still deliver, but might be a warning. Let's just allow it for now.
      }

      if (scannedCylinders.some(c => c.id === foundCylinder.id)) {
        setErrorMsg(`ถังแก๊สรหัส ${code} ถูกเพิ่มในรายการแล้ว`);
        setInputValue("");
        return;
      }

      setScannedCylinders([...scannedCylinders, foundCylinder]);
      setInputValue("");
      setErrorMsg("");
    }
  };

  const removeCylinder = (id: string) => {
    setScannedCylinders(scannedCylinders.filter(c => c.id !== id));
  };

  // Group by product for summary
  const summary = scannedCylinders.reduce((acc, cyl) => {
    const pId = cyl.productId!;
    if (!acc[pId]) {
      acc[pId] = { product: cyl.product!, count: 0 };
    }
    acc[pId].count += 1;
    return acc;
  }, {} as Record<string, { product: Product, count: number }>);

  // The form will submit this hidden input containing the array of cylinder IDs
  const cylinderIds = scannedCylinders.map(c => c.id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6 border-t border-border pt-6">
      <input type="hidden" name="cylinderIds" value={JSON.stringify(cylinderIds)} />
      
      {/* Left Side: Scanner & Table */}
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5" />
          2. สแกนสินค้าท่อแก๊ส
        </h3>

        <div className="bg-gray-50 border border-border rounded-xl p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สแกนบาร์โค้ดถังแก๊ส (QR Code หรือ Asset Code)
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ScanLine className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleScan}
                placeholder="สแกน หรือ พิมพ์รหัสแล้วกด Enter"
                className="pl-10 w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-lg"
              />
            </div>
            <button 
              type="button"
              onClick={() => handleScan({ key: 'Enter', preventDefault: () => {} } as any)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              เพิ่ม
            </button>
          </div>
          {errorMsg && (
            <p className="text-red-500 text-sm mt-2 font-medium">{errorMsg}</p>
          )}
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100/50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 w-16 text-center">ลำดับ</th>
                <th className="px-4 py-3">รหัสถัง (Asset / QR)</th>
                <th className="px-4 py-3">ประเภทสินค้า</th>
                <th className="px-4 py-3 text-right">ราคา</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scannedCylinders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีสินค้าในรายการ กรุณาสแกนบาร์โค้ด
                  </td>
                </tr>
              ) : (
                scannedCylinders.map((cyl, index) => (
                  <tr key={cyl.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{cyl.assetCode}</div>
                      <div className="text-xs text-gray-500">{cyl.qrCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      {cyl.product ? `${cyl.product.name} (${cyl.product.sizeKg} กก.)` : 'ไม่ระบุ'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cyl.product ? `${cyl.product.salePrice.toLocaleString()} ฿` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeCylinder(cyl.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side: Summary */}
      <div className="w-full lg:w-80 shrink-0 bg-gray-50 rounded-xl border border-border p-4 h-fit sticky top-6">
        <h3 className="font-bold text-foreground mb-4">สรุปรายการสินค้า</h3>
        
        {Object.keys(summary).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีสินค้า</p>
        ) : (
          <div className="space-y-3 mb-6">
            {Object.values(summary).map(item => (
              <div key={item.product.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-border shadow-sm">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.product.sizeKg} กก.</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">x {item.count}</span>
                  <p className="text-xs text-primary font-medium">{(item.product.salePrice * item.count).toLocaleString()} ฿</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">ยอดรวมทั้งหมด</span>
            <span className="text-xl font-bold text-primary">
              {scannedCylinders.reduce((sum, cyl) => sum + (cyl.product?.salePrice || 0), 0).toLocaleString()} ฿
            </span>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">* ราคานี้ยังไม่รวมค่าจัดส่ง</p>
        </div>
      </div>
    </div>
  );
}
