"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function PosSessionPanel({ session, onChange }) {
  const [openingCash, setOpeningCash] = useState(0);
  const [note, setNote] = useState("");
  const [closingCash, setClosingCash] = useState(0);
  const [closeNote, setCloseNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function open() {
    setBusy(true);
    try {
      const res = await fetch(`${API}/pos/sessions`, {

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingCash, note: note || undefined })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to open session");
      onChange(json.data);
      toast("Session opened", "success");
      setOpeningCash(0); setNote("");
    } catch (e) {
      toast(e.message || "Failed", "error");
    } finally { setBusy(false); }
  }

  async function close() {
    if (!session) return;
    if (!confirm("Close this POS session?")) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/pos/sessions/${session.id}`, {

        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closingCash, note: closeNote || undefined })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to close");
      toast("Session closed", "success");
      onChange(null);
      setClosingCash(0); setCloseNote("");
    } catch (e) {
      toast(e.message || "Failed", "error");
    } finally { setBusy(false); }
  }

  if (session) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-medium">Session open</span>
          <span className="text-xs text-slate-400">since {new Date(session.openedAt).toLocaleTimeString()}</span>
        </div>
        <div className="text-xs text-slate-400">Opening cash: ₹{Number(session.openingCash).toFixed(2)}</div>
        <Input type="number" placeholder="Closing cash" value={closingCash} onChange={(e) => setClosingCash(Number(e.target.value))} className="bg-slate-900 border-slate-700" />
        <Textarea placeholder="Closing note (optional)" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} className="bg-slate-900 border-slate-700" />
        <Button size="sm" variant="destructive" onClick={close} disabled={busy} className="w-full">Close session</Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="text-amber-400 font-medium">No session open</div>
      <Input type="number" placeholder="Opening cash" value={openingCash} onChange={(e) => setOpeningCash(Number(e.target.value))} className="bg-slate-900 border-slate-700" />
      <Textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="bg-slate-900 border-slate-700" />
      <Button size="sm" onClick={open} disabled={busy} className="w-full">Open session</Button>
    </div>
  );
}
