"use client";

import { Button, PageContainer } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageContainer className="py-16"><div role="alert" className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center">
    <h1 className="text-2xl font-extrabold">We couldn’t load the catalogue</h1>
    <p className="mt-3 text-muted">Please try again in a moment.</p>
    <Button className="mt-6" onClick={reset}>Try again</Button>
  </div></PageContainer>;
}
