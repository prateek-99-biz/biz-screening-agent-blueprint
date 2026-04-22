"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ roleId }: { roleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this role? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete role");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      alert("Failed to delete role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded border border-red-300 dark:border-red-700 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
