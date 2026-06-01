"use client";

import { useToast } from "./Toast";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch {
      toast("Could not copy", "error");
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-ghost !py-1.5 !px-3 text-xs">
      {label}
    </button>
  );
}
