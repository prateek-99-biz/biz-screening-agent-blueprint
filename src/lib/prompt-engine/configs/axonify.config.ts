import { RoleConfig } from "../types";

// ============================================================
// axonifyConfig
// The original Customer Support Specialist (Axonify) role,
// expressed as a RoleConfig. This is the source of truth for
// the first deployed agent and the baseline for all future roles.
// ============================================================

export const axonifyConfig: RoleConfig = {
  // ── Identity ───────────────────────────────────────────────
  role_title: "Customer Support Specialist (Axonify)",
  company_name: "Biz Group",
  agent_name: "[AGENT_NAME]",

  // ── Call logistics ─────────────────────────────────────────
  call_duration_target: [10, 12],
  call_hard_limit_minutes: 15,

  // ── Screening logic ────────────────────────────────────────
  notice_period_threshold_weeks: 2,

  // ── Language requirements ──────────────────────────────────
  language_requirements:
    "This role requires excellent English communication, Arabic is a strong plus given our UAE and KSA client base. Could you tell me what languages you speak and your level of proficiency in each?",
  capture_arabic_capability: true,

  // ── Scenario questions ─────────────────────────────────────
  scenario_questions: [
    {
      id: "q3",
      label: "Onboarding Urgency vs Quality",
      target_duration_seconds: [60, 90],
      question_text:
        "Next, a scenario. You're onboarding a new client who needs their Axonify platform live in ten days for a major product launch. During setup, you notice their uploaded learning content has inconsistent formatting and several broken links. The client says just get it live, we'll fix it later. What do you do?",
      probe_if_vague:
        "Mind if I ask a quick follow-up — what would you do first, and how would you explain it to the client?",
      short_answer_nudge:
        "And what would that conversation look like — what would you actually say to them?",
    },
    {
      id: "q4",
      label: "Technical Troubleshooting Under Pressure",
      target_duration_seconds: [60, 90],
      question_text:
        "Here's another scenario. A client emails at two pm on a Thursday saying two hundred of their learners can't access the platform, and their CEO is presenting on the programme Friday morning. You're not a technical expert, and Axonify's central support team is five hours behind in a different timezone. How do you handle this?",
      probe_if_vague:
        "What would your first two checks be before escalating?",
      short_answer_nudge:
        "Walk me through the first thing you'd actually do.",
    },
    {
      id: "q5",
      label: "Training Delivery Challenge",
      target_duration_seconds: [60, 90],
      question_text:
        "You're delivering admin training to a client team in Riyadh. One participant repeatedly interrupts to say this won't work for us and questions every feature. Others in the session are getting frustrated. How do you handle that in the moment?",
      probe_if_vague:
        "How would you keep the session moving while still addressing them?",
      short_answer_nudge:
        "What would you actually say to that participant?",
    },
    {
      id: "q6",
      label: "Cross-Team Collaboration",
      target_duration_seconds: [60, 90],
      question_text:
        "A client asks you to pull a complex Power BI report showing learning completion by department and job role. You know your CSM has already built something similar for another client. It would take you three hours from scratch, or thirty minutes if you collaborate — but the CSM is busy managing multiple accounts. What do you do?",
      probe_if_vague:
        "How would you approach the CSM respectfully and efficiently?",
      short_answer_nudge:
        "What would that message to the CSM actually look like?",
    },
    {
      id: "q7",
      label: "Learning New Technology",
      target_duration_seconds: [90, 120],
      question_text:
        "Describe a time you had to learn a new software platform, tool, or technical process quickly — within two to four weeks. What was it, how did you approach learning it, and how confident were you using it by the end?",
      probe_if_vague:
        "Even a support tool, CRM, or reporting system — anything recent?",
      short_answer_nudge:
        "What did the first week of learning that look like for you?",
    },
  ],

  // ── Logic question ─────────────────────────────────────────
  logic_question: {
    question_text:
      "Quick logic check. You're assigning learning modules to three teams. Team A in Dubai receives modules one, two, three, and five. Team B in Riyadh receives modules one, two, four, and five. Team C in Abu Dhabi receives modules two, three, four, and five. Which modules should all three teams receive?",
    option_a: "modules one and five",
    option_b: "modules two and five",
    option_c: "modules one, two, and five",
    correct_option: "B",
    field_name: "q8_answer",
  },

  // ── Feedback question ──────────────────────────────────────
  feedback_question:
    "Your CSM gives you feedback that a client complained you were too technical in your admin training and they felt overwhelmed. You thought the session went well. How do you respond to that feedback?",
  feedback_probe: "What would you do differently next time?",

  // ── Culture ratings ────────────────────────────────────────
  culture_intro:
    "Last section. Biz Group is high-energy, collaborative, and fast-paced. I'll read four statements — please rate yourself one to five for each, where one is not me at all and five is definitely me.",
  culture_statements: [
    {
      field_name: "q10_fast_pace",
      statement: "I thrive in fast-paced environments with changing priorities.",
    },
    {
      field_name: "q10_collaboration",
      statement: "I actively collaborate and ask for help when I need it.",
    },
    {
      field_name: "q10_client_energy",
      statement: "I'm energised by client interaction and training delivery.",
    },
    {
      field_name: "q10_pressure",
      statement: "I stay positive and solution-focused under pressure.",
    },
  ],

  // ── Scoring rubric (used by triage AI, not the voice agent) ─
  scoring_rubric: {
    q3: {
      strong:
        "Candidate prioritises quality without abandoning the deadline — proposes a partial launch, escalates the content issue to the client clearly, and offers a concrete fix plan.",
      adequate:
        "Candidate acknowledges the problem and mentions communicating with the client, but plan is vague.",
      vague:
        "Candidate simply agrees with the client to launch as-is with no mention of the content issues.",
    },
    q4: {
      strong:
        "Candidate immediately triages (checks status page, tests access themselves), communicates proactively to the client and CEO, escalates with full context to Axonify support, and sets a check-in cadence.",
      adequate:
        "Candidate escalates to Axonify support and notifies the client but lacks a structured approach.",
      vague:
        "Candidate only says 'escalate to support' with no client communication or prioritisation logic.",
    },
    q5: {
      strong:
        "Candidate acknowledges the disruptor's concern privately or in a structured way, redirects the group, and keeps the session on track without dismissing the individual.",
      adequate:
        "Candidate addresses the concern but loses session momentum or over-focuses on the individual.",
      vague:
        "Candidate ignores the disruption or says they would 'just continue'.",
    },
    q6: {
      strong:
        "Candidate proactively reaches out to the CSM with context, offers to do the adaptation work themselves, and sets a realistic timeline for the client.",
      adequate:
        "Candidate asks the CSM for help but doesn't frame it efficiently or manage client expectations.",
      vague:
        "Candidate either does it all from scratch without considering collaboration, or waits for the CSM without taking initiative.",
    },
    q7: {
      strong:
        "Specific tool named, clear learning strategy described (docs, practice, peers), measurable outcome stated.",
      adequate:
        "Example given but learning approach is generic ('I just used it more') and outcome is vague.",
      vague:
        "No specific example, or candidate claims they pick up everything instantly with no detail.",
    },
  },
};
