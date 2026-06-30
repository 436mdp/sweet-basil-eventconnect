"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QRDisplayProps {
  qrCodeUrl: string;
  joinUrl: string;
  eventName: string;
}

export function QRDisplay({ qrCodeUrl, joinUrl, eventName }: QRDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${eventName.replace(/\s+/g, "-")}-qr.png`;
    link.click();
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="relative h-64 w-64 overflow-hidden rounded-xl border bg-white p-4">
          <Image src={qrCodeUrl} alt={`QR code for ${eventName}`} fill className="object-contain" />
        </div>
        <p className="break-all text-center text-sm text-muted-foreground">{joinUrl}</p>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
