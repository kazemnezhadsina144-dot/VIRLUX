import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 py-10 px-6 text-center">
      <p className="font-medium text-slate-300">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-4 inline-flex text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
