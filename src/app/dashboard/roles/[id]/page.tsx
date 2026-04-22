import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyLinkButton } from "./copy-link-button";
import { DeployButton } from "./deploy-button";
import { DeleteButton } from "./delete-button";
import { RegenerateLinkButton } from "./regenerate-link-button";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (!role) notFound();

  const agentLink = role.shareable_link || null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline dark:text-blue-400 mb-4 block">
        &larr; Back to roles
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{role.title}</h1>
        <div className="flex items-center gap-3">
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
          <Link
            href={`/dashboard/roles/${role.id}/edit`}
            className="rounded border border-[var(--border-default)] px-3 py-1 text-xs font-medium hover:bg-[var(--bg-surface)]"
          >
            Edit
          </Link>
          <DeleteButton roleId={role.id} />
        </div>
      </div>

      {agentLink && (
        <div className="mb-6 rounded-lg border-2 border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 p-5">
          <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
            🔗 Shareable Agent Link
          </p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              readOnly
              value={agentLink}
              className="flex-1 text-sm bg-[var(--input-bg)] text-[var(--input-text)] rounded px-3 py-2 border border-green-300 dark:border-green-600 font-mono"
            />
            <CopyLinkButton link={agentLink} />
          </div>
          <div className="flex items-center gap-3">
            <a
              href={agentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
            >
              Open agent in new tab →
            </a>
            <RegenerateLinkButton roleId={role.id} />
          </div>
        </div>
      )}

      {!agentLink && role.elevenlabs_agent_id && (
        <div className="mb-6 rounded-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 p-5">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
            ⚠️ Agent deployed but no shareable link
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
            Agent ID: <code className="bg-[var(--bg-surface-alt)] px-1 rounded text-xs">{role.elevenlabs_agent_id}</code>
          </p>
          <RegenerateLinkButton roleId={role.id} />
        </div>
      )}

      {role.status === "draft" && (
        <div className="mb-6">
          <DeployButton roleId={role.id} />
        </div>
      )}

      <div className="space-y-4 text-sm">
        <Detail label="Company" value={role.company_name} />
        <Detail label="Hiring Manager Email" value={role.hiring_manager_email} />
        <Detail label="Call Duration" value={`${role.call_duration_min}–${role.call_duration_max} min`} />
        <Detail label="Hard Limit" value={`${role.call_hard_limit_minutes} min`} />
        <Detail label="Notice Period Threshold" value={`${role.notice_period_threshold_weeks} weeks`} />
        <Detail label="Language Requirements" value={role.language_requirements} />
        <Detail label="Capture Arabic" value={role.capture_arabic_capability ? "Yes" : "No"} />
        <Detail label="Voice ID" value={role.voice_id} />
        <Detail label="ElevenLabs Agent ID" value={role.elevenlabs_agent_id} />
        <Detail label="Feedback Question" value={role.feedback_question} />
        <Detail label="Feedback Probe" value={role.feedback_probe} />
        <Detail label="Culture Intro" value={role.culture_intro} />

        <JsonDetail label="Scenario Questions" value={role.scenario_questions} />
        <JsonDetail label="Logic Question" value={role.logic_question} />
        <JsonDetail label="Culture Statements" value={role.culture_statements} />
        <JsonDetail label="Scoring Rubric" value={role.scoring_rubric} />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="font-medium text-[var(--text-primary)]">{label}:</span>{" "}
      <span className="text-[var(--text-secondary)]">{value || "—"}</span>
    </div>
  );
}

function JsonDetail({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <span className="font-medium text-[var(--text-primary)] block mb-1">{label}:</span>
      <pre className="bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] rounded p-3 text-xs overflow-auto max-h-60">
        {value ? JSON.stringify(value, null, 2) : "—"}
      </pre>
    </div>
  );
}
