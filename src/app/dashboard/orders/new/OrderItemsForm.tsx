"use client";

import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";

export default function OrderItemsForm({ products, initialItems }: { products: any[], initialItems?: any[] }) {
  const [items, setItems] = useState(
    initialItems && initialItems.length > 0 
      ? initialItems 
      : [ { id: Date.now(), productId: "", quantity: 1 } ]
  );
  const [activeRowId, setActiveRowId] = useState<number | null>(items[0].id);

  const addItem = () => {
    const newId = Date.now();
    setItems([...items, { id: newId, productId: "", quantity: 1 }]);
    setActiveRowId(newId);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      setItems([{ id: Date.now(), productId: "", quantity: 1 }]);
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const selectProductForRow = (productId: string) => {
    if (!activeRowId) return;
    setItems(items.map(item => item.id === activeRowId ? { ...item, productId } : item));
    // Move active to next empty row or add new
    const nextEmpty = items.find(item => item.id !== activeRowId && !item.productId);
    if (nextEmpty) {
      setActiveRowId(nextEmpty.id);
    } else {
      setActiveRowId(null);
    }
  };

  // The form will submit this hidden input containing the array of product IDs
  const productIds = items.flatMap(item => 
    item.productId ? Array(item.quantity).fill(item.productId) : []
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6 border-t border-border pt-6">
      <input type="hidden" name="productIds" value={JSON.stringify(productIds)} />
      
      {/* Left Side: Table */}
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5" />
          2. สินค้า
        </h3>

        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100/50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 w-24"></th>
                <th className="px-4 py-3 w-32">รหัส</th>
                <th className="px-4 py-3">ชื่อสินค้า <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 w-32 text-right">จำนวน <span className="text-red-500">*</span></th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const code = product ? product.id.slice(-6).toUpperCase() : "";
                const name = product ? `${product.name} (${product.sizeKg} กก.)` : "";
                const isActive = activeRowId === item.id;

                return (
                  <tr key={item.id} className={`${isActive ? 'bg-blue-50/30' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setActiveRowId(item.id)}
                        className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                          isActive 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        เลือก
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        readOnly
                        value={code}
                        placeholder="รหัสสินค้า"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-gray-50 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        readOnly
                        value={name}
                        placeholder="คลิกเลือกสินค้าจากรายการด้านขวา"
                        className="w-full rounded-md border border-border px-3 py-2 text-sm bg-gray-50 outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-full rounded-md border border-border px-3 py-2 text-sm text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 bg-gray-50/50 border-t border-border">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              เพิ่มสินค้า
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Product List */}
      <div className="w-full lg:w-80 shrink-0 bg-gray-50 rounded-xl border border-border p-4 h-fit sticky top-6">
        <h3 className="font-bold text-foreground mb-4">รายการสินค้า</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {products.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProductForRow(p.id)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all text-left group"
            >
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                <p className="text-xs text-gray-500">รหัส: {p.id.slice(-6).toUpperCase()}</p>
              </div>
              <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {p.sizeKg} กก.
              </span>
            </button>
          ))}
        </div>
        {!activeRowId && (
          <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded border border-amber-200">
            * กรุณากดปุ่ม "เลือก" ในตารางก่อนเพื่อเพิ่มสินค้า
          </p>
        )}
      </div>
    </div>
  );
}
