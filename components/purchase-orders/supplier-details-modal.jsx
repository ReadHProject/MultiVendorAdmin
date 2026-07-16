"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SupplierDetailsModal({ supplier, open, onOpenChange }) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{supplier.companyName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Contact Person</div>
              <div className="text-sm">{supplier.contactName || "---"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">GSTIN</div>
              <div className="text-sm">{supplier.gstin || "---"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Email</div>
              <div className="text-sm">{supplier.email || "---"}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Phone</div>
              <div className="text-sm">{supplier.phone || "---"}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase text-muted-foreground">Address</div>
            <div className="text-sm">
              {[supplier.address, supplier.addressLine1, supplier.addressLine2, supplier.city, supplier.state, supplier.pincode].filter(Boolean).join(", ") || "---"}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-2">Bank Details</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">Bank Name</div>
                <div className="text-sm">{supplier.bankName || "---"}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">Account</div>
                <div className="text-sm">{supplier.bankAccount || "---"}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">IFSC</div>
                <div className="text-sm">{supplier.ifsc || "---"}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">Account Holder</div>
                <div className="text-sm">{supplier.accountHolderName || "---"}</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-2">Pricing Margins</div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-xs text-muted-foreground">Dealer:</span> <span className="text-sm font-medium">{supplier.dealerMargin || 0}%</span></div>
              <div><span className="text-xs text-muted-foreground">Wholesaler:</span> <span className="text-sm font-medium">{supplier.wholesalerMargin || 0}%</span></div>
              <div><span className="text-xs text-muted-foreground">Retail:</span> <span className="text-sm font-medium">{supplier.retailMargin || 0}%</span></div>
              <div><span className="text-xs text-muted-foreground">Parlour:</span> <span className="text-sm font-medium">{supplier.parlourMargin || 0}%</span></div>
              <div><span className="text-xs text-muted-foreground">Online:</span> <span className="text-sm font-medium">{supplier.onlineMargin || 0}%</span></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
