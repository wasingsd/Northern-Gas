"use client";

import { useState, useRef, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  taxType: string;
  taxId: string | null;
  branchName: string | null;
  branchNo: string | null;
  customerCode: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function CustomerSection({ customers, initialData }: { customers: Customer[], initialData?: Customer }) {
  const [query, setQuery] = useState(initialData?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [taxType, setTaxType] = useState(initialData?.taxType || "UNSPECIFIED");
  const [taxId, setTaxId] = useState(initialData?.taxId || "");
  const [branchName, setBranchName] = useState(initialData?.branchName || "");
  const [branchNo, setBranchNo] = useState(initialData?.branchNo || "");
  const [customerCode, setCustomerCode] = useState(initialData?.customerCode || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [address, setAddress] = useState(initialData?.address || "");

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
    setTaxType(c.taxType || "UNSPECIFIED");
    setTaxId(c.taxId || "");
    setBranchName(c.branchName || "");
    setBranchNo(c.branchNo || "");
    setCustomerCode(c.customerCode || "");
    setPhone(c.phone || "");
    setEmail(c.email || "");
    setAddress(c.address || "");
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
        <div className="flex items-center gap-6">
          <div className="w-48 text-gray-700 font-medium">ค้นหา / ชื่อลูกค้า <span className="text-red-500">*</span></div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              name="customerName" 
              value={query}
              onChange={handleNameChange}
              onFocus={() => setShowDropdown(true)}
              required
              autoComplete="off"
              placeholder="พิมพ์ชื่อลูกค้า เพื่อค้นหาหรือสร้างใหม่" 
              className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                      {c.phone && <span className="text-sm text-gray-500 ml-2">({c.phone})</span>}
                    </div>
                    {c.customerCode && <span className="text-xs text-gray-400">{c.customerCode}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Fields to retain data when a customer is selected */}
      <input type="hidden" name="customerTaxType" value={taxType} />
      <input type="hidden" name="customerTaxId" value={taxId} />
      <input type="hidden" name="customerBranchName" value={branchName} />
      <input type="hidden" name="customerBranchNo" value={branchNo} />
      <input type="hidden" name="customerPhone" value={phone} />
      <input type="hidden" name="customerEmail" value={email} />
      <input type="hidden" name="customerAddress" value={address} />

      <div className="flex items-center gap-6">
        <div className="w-48 text-gray-700 font-medium">รหัสลูกค้า</div>
        <div className="flex-1">
          <input 
            type="text" 
            name="customerCode" 
            value={customerCode}
            onChange={e => setCustomerCode(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
    </div>
  );
}
