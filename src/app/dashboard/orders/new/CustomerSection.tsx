"use client";

import { useState, useRef, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  customerCode: string | null;
};

export default function CustomerSection({ customers, initialData }: { customers: Customer[], initialData?: Customer }) {
  const [query, setQuery] = useState(initialData?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [customerCode, setCustomerCode] = useState(initialData?.customerCode || "");

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    (c.customerCode && c.customerCode.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelectCustomer = (c: Customer) => {
    setQuery(c.name);
    setCustomerCode(c.customerCode || "");
    setShowDropdown(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className="space-y-6 border border-border p-6 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">1. ข้อมูลลูกค้า</h3>
      
      {/* Search / Name Field with Dropdown */}
      <div className="relative" ref={wrapperRef}>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div className="text-gray-700 font-medium md:w-48">ค้นหา / ชื่อ หรือ รหัสลูกค้า <span className="text-red-500">*</span></div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              name="customerName" 
              value={query}
              onChange={handleNameChange}
              onFocus={() => setShowDropdown(true)}
              required
              autoComplete="off"
              placeholder="พิมพ์ชื่อ หรือ รหัสลูกค้า เพื่อค้นหาหรือสร้างใหม่" 
              className="w-full rounded-lg border border-border px-4 py-3 text-base md:text-sm md:py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            
            {showDropdown && query.length > 0 && filteredCustomers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-border mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map(c => (
                  <li 
                    key={c.id} 
                    onClick={() => handleSelectCustomer(c)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                    {c.customerCode && <span className="text-xs text-gray-400">{c.customerCode}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>



      <input type="hidden" name="customerCode" value={customerCode} />
    </div>
  );
}
