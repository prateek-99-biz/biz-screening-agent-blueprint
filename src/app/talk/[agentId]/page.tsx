import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CallPanel } from "./call-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("roles")
    .select("title, company_name")
    .eq("elevenlabs_agent_id", agentId)
    .single();

  return {
    title: role ? `${role.title} – ${role.company_name} Screening` : "Screening",
  };
}

export default async function TalkPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const supabase = await createClient();
  const { data: role } = await supabase
    .from("roles")
    .select(
      "title, company_name, job_description, hiring_manager_email, language_requirements, call_duration_min, call_duration_max, call_hard_limit_minutes, notice_period_threshold_weeks, capture_arabic_capability, elevenlabs_agent_id"
    )
    .eq("elevenlabs_agent_id", agentId)
    .single();

  if (!role) notFound();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — Job details */}
      <div className="lg:w-2/5 w-full border-b lg:border-b-0 lg:border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-md mx-auto lg:mx-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {role.company_name}
          </p>
          <h1 className="text-2xl font-bold mb-6">{role.title}</h1>

          {role.job_description && (
            <Section title="About the Role">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {role.job_description}
              </p>
            </Section>
          )}

          <Section title="Interview Details">
            <DetailRow
              label="Expected Duration"
              value={`${role.call_duration_min}–${role.call_duration_max} minutes`}
            />
            <DetailRow
              label="Maximum Duration"
              value={`${role.call_hard_limit_minutes} minutes`}
            />
            {role.language_requirements && (
              <DetailRow label="Languages" value={role.language_requirements} />
            )}
            {role.capture_arabic_capability && (
              <DetailRow label="Arabic Assessment" value="Included" />
            )}
            {role.notice_period_threshold_weeks && (
              <DetailRow
                label="Notice Period"
                value={`Up to ${role.notice_period_threshold_weeks} weeks preferred`}
              />
            )}
          </Section>

          {role.hiring_manager_email && (
            <Section title="Contact">
              <p className="text-sm text-[var(--text-secondary)]">
                {role.hiring_manager_email}
              </p>
            </Section>
          )}

          <div className="mt-8 p-4 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <strong>Tips:</strong> Find a quiet space, use headphones if possible,
              and speak clearly. The AI interviewer will guide you through the process.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — Call interface */}
      <div className="lg:w-3/5 w-full flex flex-col min-h-[600px] lg:min-h-0 lg:h-screen">
        <CallPanel agentId={agentId} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium">{value}</span>
    </div>
  );
}
