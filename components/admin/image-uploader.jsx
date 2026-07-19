"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image, Trash2, Plus } from "lucide-react";

const API = typeof window !== "undefined"
  ? "/api/v1"
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1");
const API_BASE = API.replace(/\/api\/v1\/?$/, "");

function getToken() {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem("erp_access_token"); } catch { return null; }
}

function ImgWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className || ""}`}>
        <Image className="h-6 w-6" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}

export function resolveImageUrl(img) {
  if (!img) return img;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${API_BASE}${img}`;
  return img;
}

export function ImageUploader({ value = [], onChange, purpose = "general", className, multiple = true, maxFiles = 10 }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const images = Array.isArray(value) ? value : (value ? [value] : []);

  function imgSrc(img) {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_BASE}${img}`;
  }

  async function onPick(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const token = getToken();
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const newImages = [...images];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("purpose", purpose);
        const res = await fetch(`${API}/upload`, {
          method: "POST",
          body: fd,
          headers,
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || "Upload failed");
        newImages.push(json.data.url);
      }
      onChange(newImages);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  }

  function addUrl() {
    if (images.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    const newImages = [...images, ""];
    onChange(newImages);
  }

  function updateUrl(index, url) {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages);
  }

  return (
    <div className={"space-y-3 " + (className || "")}>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative group h-20 w-20 rounded border bg-slate-100 flex items-center justify-center">
            {img ? (
              <>
                <ImgWithFallback src={resolveImageUrl(img)} alt="" className="h-full w-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            ) : (
              <input
                type="text"
                placeholder="Paste image URL"
                value={img}
                onChange={(e) => updateUrl(idx, e.target.value)}
                className="w-full h-full px-2 text-xs text-center bg-transparent focus:outline-none"
              />
            )}
          </div>
        ))}
        {images.length < maxFiles && (
          <div className="h-20 w-20 rounded border border-dashed border-slate-300 flex items-center justify-center">
            <input ref={inputRef} type="file" accept="image/*" onChange={onPick} disabled={uploading} className="hidden" multiple={multiple} />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-slate-400 hover:text-primary"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      {images.length >= maxFiles && (
        <p className="text-xs text-muted-foreground">Maximum {maxFiles} images reached</p>
      )}
    </div>
  );
}