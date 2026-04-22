import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Biz Group Screening</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Roles</h2>
        <Link
          href="/dashboard/roles/new"
          className="rounded bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]"
        >
          Create new role
        </Link>
      </div>

      {!roles || roles.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm">No roles yet. Create one to get started.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-left">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-[var(--border-default)]">
                <td className="py-2 pr-4">{role.title}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      role.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : role.status === "draft"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {role.status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {new Date(role.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Link
                    href={`/dashboard/roles/${role.id}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
