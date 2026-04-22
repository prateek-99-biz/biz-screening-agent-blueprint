"use client";

import { useState } from "react";

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded bg-[var(--btn-primary-bg)] px-3 py-1.5 text-xs font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] whitespace-nowrap"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
