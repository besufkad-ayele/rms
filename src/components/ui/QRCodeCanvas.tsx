"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeCanvas({ value, size = 180, className = "" }: QRCodeCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function generate() {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 1,
          color: {
            dark: "#2A1810", // Brand primary dark
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        if (isMounted) setDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    }
    generate();
    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-bg-subtle rounded-card border border-divider text-xs text-brand-secondary animate-pulse"
      >
        Generating QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code for ${value}`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
