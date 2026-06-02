"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function OrderItemsForm({ products }: { products: any[] }) {
  const [items, setItems] = useState([ { id: Date.now(), productId: "", quantity: 1 } ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: "", quantity: 1 }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return; // Must have at least 1 item
    setItems(items.filter(item => item.id !== id));
  };

  const updateItemProduct = (id: number, productId: string) => {
    setItems(items.map(item => item.id === id ? { ...item, productId } : item));
  };

  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  // The form will submit this hidden input containing the array of product IDs
  const productIds = items.flatMap(item => 
    item.productId ? Array(item.quantity).fill(item.productId) : []
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name="productIds" value={JSON.stringify(productIds)} />
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">2. รายการถังแก๊ส</label>
      </div>

      <div className="space-y-3 border border-border p-4 rounded-lg bg-gray-50/50">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
            <select
              value={item.productId}
              onChange={(e) => updateItemProduct(item.id, e.target.value)}
              required
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">-- เลือกสินค้าแก๊ส --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sizeKg} กก.)</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">จำนวน:</span>
              <input 
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                className="w-20 rounded-lg border border-border px-3 py-2 text-sm text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={items.length === 1}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-dashed border-primary/30"
          >
            <Plus className="h-4 w-4" />
            เพิ่มถังแก๊สอีก
          </button>
        </div>
      </div>
    </div>
  );
}
