"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateLinkButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/${roleId}/regenerate-link`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to regenerate link");
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to regenerate link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRegenerate}
      disabled={loading}
      className="rounded border border-blue-300 dark:border-blue-700 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
    >
      {loading ? "Regenerating..." : "Regenerate link"}
    </button>
  );
}
