"use client";
import Image from "next/image";
import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { addProductImage, deleteProductImage } from "@/lib/api/products";
import { useAuth } from "@/store/AuthContext";
import { ProductImage } from "@/types/admin";

export default function ProductImageManager({
  productSlug,
  images,
  onImagesChange,
}: {
  productSlug: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}) {
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !url.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const image = await addProductImage(token, productSlug, {
        image: url.trim(),
        altText: altText.trim(),
        order: images.length,
      });
      onImagesChange([...images, image]);
      setUrl("");
      setAltText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add image.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(imageId: number) {
    if (!token) return;
    setPendingId(imageId);
    try {
      await deleteProductImage(token, imageId);
      onImagesChange(images.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to remove image.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="font-black">Images</h2>
      <p className="mt-1 text-xs text-slate-500">
        Paste an image URL (e.g. <code>/images/products/your-file.jpg</code> served from{" "}
        <code>public/</code>, or a Cloudinary/S3 URL).
      </p>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-slate-50">
                <Image src={img.image} alt={img.altText || ""} fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                disabled={pendingId === img.id}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-black text-red-600 shadow disabled:opacity-50"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Alt text (optional)"
          className="w-40 rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={adding || !url.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
