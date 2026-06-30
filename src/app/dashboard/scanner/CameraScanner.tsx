"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  useEffect(() => {
    // Check if mediaDevices is supported (requires HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("ไม่สามารถเปิดกล้องได้: เบราว์เซอร์ต้องการการเชื่อมต่อแบบ HTTPS หรือ Localhost เพื่อใช้งานกล้อง");
      onClose();
      return;
    }

    // We only want to use the camera, no file upload
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // We got a scan!
        if (scannerRef.current) {
          scannerRef.current.clear(); // stop scanning
        }
        onScanSuccess(decodedText);
      },
      (error) => {
        // Ignored, happens continuously while looking for QR
      }
    );

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch(e) {
          console.error(e);
        }
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
        <h3 className="font-bold text-lg">สแกนด้วยกล้อง</h3>
        <button onClick={onClose} className="px-4 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors">
          ปิดกล้อง
        </button>
      </div>
      <div className="flex-1 overflow-auto flex flex-col bg-gray-100">
        <div id="qr-reader" className="w-full max-w-lg mx-auto bg-white border-0"></div>
      </div>
      
      {/* Basic styles to override html5-qrcode's ugly defaults */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: black; }
        #qr-reader button {
          padding: 8px 16px;
          background-color: #f97316; /* primary orange */
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 10px;
          cursor: pointer;
        }
        #qr-reader select {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
          width: 100%;
        }
      `}} />
    </div>
  );
}
