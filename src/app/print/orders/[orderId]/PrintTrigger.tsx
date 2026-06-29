"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // Wait a brief moment for fonts/styles to load before printing
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
