import type { HTMLAttributes } from "react";

export function PageContainer(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`page-container ${props.className ?? ""}`.trim()} />;
}
