import { formatSmeTxStatus } from "@virlux/shared";

export function StatusBadge({ status }: { status: string }) {
  const label = formatSmeTxStatus(status);
  let cls = "badge-slate";
  if (status === "confirmed") cls = "badge-green";
  else if (status === "awaiting_approval") cls = "badge-amber";
  else if (status === "submitted_to_partner" || status === "processing") cls = "badge bg-blue-500/15 text-blue-300";
  else if (status === "failed") cls = "badge bg-red-500/15 text-red-400";

  return <span className={cls}>{label}</span>;
}
