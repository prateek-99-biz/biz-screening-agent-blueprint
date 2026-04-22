"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [form, setForm] = useState<Record<string, string | number | boolean> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const res = await fetch(`/api/roles/${roleId}`);
      if (!res.ok) {
        setError("Failed to load role");
        setFetching(false);
        return;
      }
      const role = await res.json();
      setForm({
        title: role.title ?? "",
        company_name: role.company_name ?? "",
        hiring_manager_email: role.hiring_manager_email ?? "",
        job_description: role.job_description ?? "",
        call_duration_min: role.call_duration_min ?? 10,
        call_duration_max: role.call_duration_max ?? 12,
        call_hard_limit_minutes: role.call_hard_limit_minutes ?? 15,
        notice_period_threshold_weeks: role.notice_period_threshold_weeks ?? 2,
        language_requirements: role.language_requirements ?? "",
        capture_arabic_capability: role.capture_arabic_capability ?? false,
        scenario_questions: JSON.stringify(role.scenario_questions, null, 2),
        logic_question: JSON.stringify(role.logic_question, null, 2),
        feedback_question: role.feedback_question ?? "",
        feedback_probe: role.feedback_probe ?? "",
        culture_intro: role.culture_intro ?? "",
        culture_statements: JSON.stringify(role.culture_statements, null, 2),
        scoring_rubric: JSON.stringify(role.scoring_rubric, null, 2),
        voice_id: role.voice_id ?? "",
      });
      setFetching(false);
    }
    fetchRole();
  }, [roleId]);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setError(null);
    setLoading(true);

    try {
      const body = {
        title: form.title,
        company_name: form.company_name,
        hiring_manager_email: form.hiring_manager_email,
        job_description: form.job_description,
        call_duration_min: form.call_duration_min,
        call_duration_max: form.call_duration_max,
        call_hard_limit_minutes: form.call_hard_limit_minutes,
        notice_period_threshold_weeks: form.notice_period_threshold_weeks,
        language_requirements: form.language_requirements,
        capture_arabic_capability: form.capture_arabic_capability,
        scenario_questions: JSON.parse(form.scenario_questions as string),
        logic_question: JSON.parse(form.logic_question as string),
        feedback_question: form.feedback_question,
        feedback_probe: form.feedback_probe,
        culture_intro: form.culture_intro,
        culture_statements: JSON.parse(form.culture_statements as string),
        scoring_rubric: JSON.parse(form.scoring_rubric as string),
        voice_id: form.voice_id,
      };

      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      router.push(`/dashboard/roles/${roleId}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON in one of the JSON fields.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-red-600 dark:text-red-400">{error || "Role not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Role</h1>

      <div className="space-y-4">
        <Field label="Role Title">
          <input
            type="text"
            value={form.title as string}
            onChange={(e) => updateField("title", e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Company Name">
          <input
            type="text"
            value={form.company_name as string}
            onChange={(e) => updateField("company_name", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Hiring Manager Email">
          <input
            type="email"
            value={form.hiring_manager_email as string}
            onChange={(e) => updateField("hiring_manager_email", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Job Description">
          <textarea
            value={form.job_description as string}
            onChange={(e) => updateField("job_description", e.target.value)}
            className="input"
            rows={4}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Call Duration Min (min)">
            <input
              type="number"
              value={form.call_duration_min as number}
              onChange={(e) => updateField("call_duration_min", parseInt(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Call Duration Max (min)">
            <input
              type="number"
              value={form.call_duration_max as number}
              onChange={(e) => updateField("call_duration_max", parseInt(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Hard Limit (min)">
            <input
              type="number"
              value={form.call_hard_limit_minutes as number}
              onChange={(e) => updateField("call_hard_limit_minutes", parseInt(e.target.value))}
              className="input"
            />
          </Field>
        </div>

        <Field label="Notice Period Threshold (weeks)">
          <input
            type="number"
            value={form.notice_period_threshold_weeks as number}
            onChange={(e) => updateField("notice_period_threshold_weeks", parseInt(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="Language Requirements">
          <textarea
            value={form.language_requirements as string}
            onChange={(e) => updateField("language_requirements", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Capture Arabic Capability">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.capture_arabic_capability as boolean}
              onChange={(e) => updateField("capture_arabic_capability", e.target.checked)}
            />
            <span className="text-sm">Yes</span>
          </label>
        </Field>

        <Field label="Scenario Questions (JSON)">
          <textarea
            value={form.scenario_questions as string}
            onChange={(e) => updateField("scenario_questions", e.target.value)}
            className="input font-mono text-xs"
            rows={12}
          />
        </Field>

        <Field label="Logic Question (JSON)">
          <textarea
            value={form.logic_question as string}
            onChange={(e) => updateField("logic_question", e.target.value)}
            className="input font-mono text-xs"
            rows={8}
          />
        </Field>

        <Field label="Feedback Question">
          <textarea
            value={form.feedback_question as string}
            onChange={(e) => updateField("feedback_question", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Feedback Probe">
          <textarea
            value={form.feedback_probe as string}
            onChange={(e) => updateField("feedback_probe", e.target.value)}
            className="input"
            rows={2}
          />
        </Field>

        <Field label="Culture Intro">
          <textarea
            value={form.culture_intro as string}
            onChange={(e) => updateField("culture_intro", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Culture Statements (JSON)">
          <textarea
            value={form.culture_statements as string}
            onChange={(e) => updateField("culture_statements", e.target.value)}
            className="input font-mono text-xs"
            rows={8}
          />
        </Field>

        <Field label="Scoring Rubric (JSON)">
          <textarea
            value={form.scoring_rubric as string}
            onChange={(e) => updateField("scoring_rubric", e.target.value)}
            className="input font-mono text-xs"
            rows={12}
          />
        </Field>

        <Field label="Voice ID">
          <input
            type="text"
            value={form.voice_id as string}
            onChange={(e) => updateField("voice_id", e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/roles/${roleId}`)}
            className="rounded border border-[var(--border-default)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-surface)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
