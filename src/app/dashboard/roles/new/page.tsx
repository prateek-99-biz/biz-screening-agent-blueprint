"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { axonifyConfig } from "@/lib/prompt-engine/configs/axonify.config";

const defaultFormData = {
  title: axonifyConfig.role_title,
  company_name: axonifyConfig.company_name,
  hiring_manager_email: "",
  job_description: "",
  call_duration_min: axonifyConfig.call_duration_target[0],
  call_duration_max: axonifyConfig.call_duration_target[1],
  call_hard_limit_minutes: axonifyConfig.call_hard_limit_minutes,
  notice_period_threshold_weeks: axonifyConfig.notice_period_threshold_weeks,
  language_requirements: axonifyConfig.language_requirements,
  capture_arabic_capability: axonifyConfig.capture_arabic_capability,
  scenario_questions: JSON.stringify(axonifyConfig.scenario_questions, null, 2),
  logic_question: JSON.stringify(axonifyConfig.logic_question, null, 2),
  feedback_question: axonifyConfig.feedback_question,
  feedback_probe: axonifyConfig.feedback_probe,
  culture_intro: axonifyConfig.culture_intro,
  culture_statements: JSON.stringify(axonifyConfig.culture_statements, null, 2),
  scoring_rubric: JSON.stringify(axonifyConfig.scoring_rubric, null, 2),
  voice_id: "",
};

export default function CreateRolePage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(action: "draft" | "deploy") {
    setError(null);
    setLoading(true);

    try {
      // Parse JSON fields
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
        scenario_questions: JSON.parse(form.scenario_questions),
        logic_question: JSON.parse(form.logic_question),
        feedback_question: form.feedback_question,
        feedback_probe: form.feedback_probe,
        culture_intro: form.culture_intro,
        culture_statements: JSON.parse(form.culture_statements),
        scoring_rubric: JSON.parse(form.scoring_rubric),
        voice_id: form.voice_id || undefined,
        action,
      };

      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create role");
      }

      const data = await res.json();
      router.push(`/dashboard/roles/${data.id}`);
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON in one of the JSON fields. Please check the format.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Role</h1>

      <div className="space-y-4">
        <Field label="Role Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Company Name">
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Hiring Manager Email">
          <input
            type="email"
            value={form.hiring_manager_email}
            onChange={(e) => updateField("hiring_manager_email", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Job Description">
          <textarea
            value={form.job_description}
            onChange={(e) => updateField("job_description", e.target.value)}
            className="input"
            rows={4}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Call Duration Min (min)">
            <input
              type="number"
              value={form.call_duration_min}
              onChange={(e) => updateField("call_duration_min", parseInt(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Call Duration Max (min)">
            <input
              type="number"
              value={form.call_duration_max}
              onChange={(e) => updateField("call_duration_max", parseInt(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Hard Limit (min)">
            <input
              type="number"
              value={form.call_hard_limit_minutes}
              onChange={(e) => updateField("call_hard_limit_minutes", parseInt(e.target.value))}
              className="input"
            />
          </Field>
        </div>

        <Field label="Notice Period Threshold (weeks)">
          <input
            type="number"
            value={form.notice_period_threshold_weeks}
            onChange={(e) => updateField("notice_period_threshold_weeks", parseInt(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="Language Requirements">
          <textarea
            value={form.language_requirements}
            onChange={(e) => updateField("language_requirements", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Capture Arabic Capability">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.capture_arabic_capability}
              onChange={(e) => updateField("capture_arabic_capability", e.target.checked)}
            />
            <span className="text-sm">Yes</span>
          </label>
        </Field>

        <Field label="Scenario Questions (JSON)">
          <textarea
            value={form.scenario_questions}
            onChange={(e) => updateField("scenario_questions", e.target.value)}
            className="input font-mono text-xs"
            rows={12}
          />
        </Field>

        <Field label="Logic Question (JSON)">
          <textarea
            value={form.logic_question}
            onChange={(e) => updateField("logic_question", e.target.value)}
            className="input font-mono text-xs"
            rows={8}
          />
        </Field>

        <Field label="Feedback Question">
          <textarea
            value={form.feedback_question}
            onChange={(e) => updateField("feedback_question", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Feedback Probe">
          <textarea
            value={form.feedback_probe}
            onChange={(e) => updateField("feedback_probe", e.target.value)}
            className="input"
            rows={2}
          />
        </Field>

        <Field label="Culture Intro">
          <textarea
            value={form.culture_intro}
            onChange={(e) => updateField("culture_intro", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <Field label="Culture Statements (JSON)">
          <textarea
            value={form.culture_statements}
            onChange={(e) => updateField("culture_statements", e.target.value)}
            className="input font-mono text-xs"
            rows={8}
          />
        </Field>

        <Field label="Scoring Rubric (JSON)">
          <textarea
            value={form.scoring_rubric}
            onChange={(e) => updateField("scoring_rubric", e.target.value)}
            className="input font-mono text-xs"
            rows={12}
          />
        </Field>

        <Field label="Voice ID (leave blank for default)">
          <input
            type="text"
            value={form.voice_id}
            onChange={(e) => updateField("voice_id", e.target.value)}
            className="input"
            placeholder="ElevenLabs voice ID"
          />
        </Field>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => handleSubmit("deploy")}
            disabled={loading}
            className="rounded bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
          >
            {loading ? "Deploying..." : "Deploy agent"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={loading}
            className="rounded border border-[var(--border-default)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-surface)] disabled:opacity-50"
          >
            Save as draft
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
