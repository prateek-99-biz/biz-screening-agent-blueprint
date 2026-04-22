import { createClient } from "@/lib/supabase/server";
import { createAgent } from "@/lib/elevenlabs/createAgent";
import { RoleConfig } from "@/lib/prompt-engine/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scenarioQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  question_text: z.string(),
  target_duration_seconds: z.tuple([z.number(), z.number()]),
  probe_if_vague: z.string(),
  short_answer_nudge: z.string(),
});

const logicQuestionSchema = z.object({
  question_text: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  correct_option: z.enum(["A", "B", "C"]),
  field_name: z.string(),
});

const cultureStatementSchema = z.object({
  field_name: z.string(),
  statement: z.string(),
});

const scoringRubricSchema = z.record(
  z.string(),
  z.object({
    strong: z.string(),
    adequate: z.string(),
    vague: z.string(),
  })
);

const createRoleSchema = z.object({
  title: z.string().min(1),
  company_name: z.string().optional().default("Biz Group"),
  hiring_manager_email: z.string().optional(),
  job_description: z.string().optional(),
  call_duration_min: z.number().int().optional().default(10),
  call_duration_max: z.number().int().optional().default(12),
  call_hard_limit_minutes: z.number().int().optional().default(15),
  notice_period_threshold_weeks: z.number().int().optional().default(2),
  language_requirements: z.string().optional(),
  capture_arabic_capability: z.boolean().optional().default(false),
  scenario_questions: z.array(scenarioQuestionSchema),
  logic_question: logicQuestionSchema,
  feedback_question: z.string(),
  feedback_probe: z.string(),
  culture_intro: z.string(),
  culture_statements: z.array(cultureStatementSchema),
  scoring_rubric: scoringRubricSchema,
  voice_id: z.string().optional(),
  action: z.enum(["draft", "deploy"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action, voice_id, ...roleData } = parsed.data;
    const voiceId = voice_id || process.env.ELEVENLABS_DEFAULT_VOICE_ID!;

    // Insert role as draft
    const { data: role, error: insertError } = await supabase
      .from("roles")
      .insert({
        ...roleData,
        voice_id: voiceId,
        status: "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // If deploy, create ElevenLabs agent
    if (action === "deploy") {
      try {
        const config: RoleConfig = {
          role_title: roleData.title,
          company_name: roleData.company_name ?? "Biz Group",
          agent_name: "[AGENT_NAME]",
          call_duration_target: [
            roleData.call_duration_min ?? 10,
            roleData.call_duration_max ?? 12,
          ],
          call_hard_limit_minutes: roleData.call_hard_limit_minutes ?? 15,
          notice_period_threshold_weeks:
            roleData.notice_period_threshold_weeks ?? 2,
          language_requirements: roleData.language_requirements ?? "",
          capture_arabic_capability:
            roleData.capture_arabic_capability ?? false,
          scenario_questions: roleData.scenario_questions,
          logic_question: roleData.logic_question,
          feedback_question: roleData.feedback_question,
          feedback_probe: roleData.feedback_probe,
          culture_intro: roleData.culture_intro,
          culture_statements: roleData.culture_statements,
          scoring_rubric: roleData.scoring_rubric,
        };

        const { agent_id, shareable_link } = await createAgent(config, voiceId);

        const { data: updatedRole, error: updateError } = await supabase
          .from("roles")
          .update({
            elevenlabs_agent_id: agent_id,
            shareable_link: shareable_link,
            status: "active",
          })
          .eq("id", role.id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updatedRole);
      } catch (deployErr: unknown) {
        // Role stays as draft, return error
        return NextResponse.json(
          {
            error: `Agent deployment failed: ${
              deployErr instanceof Error ? deployErr.message : "Unknown error"
            }`,
            id: role.id,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(role);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
