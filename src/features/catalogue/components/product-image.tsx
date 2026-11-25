"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductImage({ src, alt, sizes, priority = false }: {
  src?: string; alt: string; sizes: string; priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="grid h-full w-full place-items-center bg-page px-4 text-center text-sm text-muted">Image coming soon</div>;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} onError={() => setFailed(true)} className="object-cover" />;
}
