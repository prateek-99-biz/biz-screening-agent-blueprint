"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeployButton({ roleId }: { roleId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDeploy() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/roles/${roleId}/deploy`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deploy failed");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleDeploy}
        disabled={loading}
        className="rounded bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
      >
        {loading ? "Deploying..." : "Deploy agent"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
    </div>
  );
}
