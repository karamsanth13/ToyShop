import { PageContainer, Skeleton } from "@/components/ui";

export default function Loading() {
  return <PageContainer className="space-y-8 py-10" aria-busy="true" aria-label="Loading catalogue">
    <Skeleton className="h-12 w-1/2"/><Skeleton className="h-11 w-full max-w-xl"/>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="aspect-[4/5]" />)}</div>
  </PageContainer>;
}
