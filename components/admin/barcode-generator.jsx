"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Barcode, Loader2 } from "lucide-react";
import { useGenerateBarcodeMutation } from "@/store/api/slices/productsApi";
import { generateEAN13 } from "@/lib/barcode";
import { toast } from "sonner";

export function BarcodeGenerator({ value, onChange, variant = "EAN13" }) {
  const [generateBarcode, { isLoading }] = useGenerateBarcodeMutation();

  const handleGenerate = async () => {
    try {
      let barcode;
      if (variant === "EAN13") {
        barcode = generateEAN13();
      } else {
        const result = await generateBarcode().unwrap();
        barcode = result.data?.barcode || generateEAN13();
      }
      onChange(barcode);
      toast.success("Barcode generated");
    } catch (err) {
      const fallback = generateEAN13();
      onChange(fallback);
      toast.success("Barcode generated (fallback)");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter or generate barcode"
        className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
        readOnly={false}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={isLoading}
        className="h-9 px-3"
        title="Generate barcode"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Barcode className="h-4 w-4" />}
      </Button>
    </div>
  );
}