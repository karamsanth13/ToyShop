"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui";

export function CatalogueSearch() {
  const router = useRouter(); const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  useEffect(() => { const timer = setTimeout(() => { const query = new URLSearchParams(params.toString()); value ? query.set("q", value) : query.delete("q"); router.replace(`/?${query.toString()}`, { scroll: false }); }, 250); return () => clearTimeout(timer); }, [value, params, router]);
  return <label className="relative block w-full max-w-xl"><span className="sr-only">Search toys by name</span><Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Find a toy by name" className="w-full pl-12" /></label>;
}
