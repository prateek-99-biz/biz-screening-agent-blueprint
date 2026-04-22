// ============================================================
// RoleConfig — the schema HR fills in to generate a new agent
// Every field maps directly to a variable slot in the prompt
// ============================================================

export interface ScenarioQuestion {
  id: string;                    // e.g. "q3", "q4"
  label: string;                 // e.g. "Onboarding Urgency vs Quality"
  question_text: string;         // The exact words the agent speaks
  target_duration_seconds: [number, number]; // e.g. [60, 90]
  probe_if_vague: string;        // Follow-up if answer is thin
  short_answer_nudge: string;    // Follow-up if answer is one-liner
}

export interface LogicQuestion {
  question_text: string;         // Full spoken question
  option_a: string;
  option_b: string;
  option_c: string;
  correct_option: "A" | "B" | "C";
  field_name: string;            // e.g. "q8_answer"
}

export interface CultureStatement {
  field_name: string;            // e.g. "q10_fast_pace"
  statement: string;             // What the agent reads aloud
}

export interface ScoringRubric {
  strong: string;                // What a strong answer looks like (for triage AI)
  adequate: string;
  vague: string;
}

export interface RoleConfig {
  // ── Identity ──────────────────────────────────────────────
  role_title: string;            // "Customer Support Specialist (Axonify)"
  company_name: string;          // "Biz Group"
  agent_name: string;            // "[AGENT_NAME]" — filled by ElevenLabs at runtime

  // ── Call logistics ────────────────────────────────────────
  call_duration_target: [number, number]; // [10, 12] minutes
  call_hard_limit_minutes: number;        // 15

  // ── Screening logic ───────────────────────────────────────
  notice_period_threshold_weeks: number;  // 2 — triage downgrades if exceeded

  // ── Language requirements ─────────────────────────────────
  language_requirements: string;  // Free text for Q2 spoken question
  capture_arabic_capability: boolean;

  // ── Scenario questions (Q3–Q7 equivalent) ─────────────────
  scenario_questions: ScenarioQuestion[];  // 4–6 questions

  // ── Logic / attention-to-detail question (Q8 equivalent) ──
  logic_question: LogicQuestion;

  // ── Open-ended question (Q9 equivalent) ───────────────────
  feedback_question: string;     // Spoken verbatim
  feedback_probe: string;        // If defensive

  // ── Culture ratings (Q10) ─────────────────────────────────
  culture_intro: string;         // Preamble before the four statements
  culture_statements: CultureStatement[]; // Exactly 4

  // ── Scoring rubric (for triage AI, not the voice agent) ───
  scoring_rubric: Record<string, ScoringRubric>; // keyed by scenario question id
}
