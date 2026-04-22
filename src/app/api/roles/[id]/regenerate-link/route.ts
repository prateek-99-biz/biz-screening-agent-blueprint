import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: role, error: fetchError } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (!role.elevenlabs_agent_id) {
    return NextResponse.json(
      { error: "Role has no deployed agent" },
      { status: 400 }
    );
  }

  // Build shareable link pointing to our /talk/ page
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const shareableLink = `${protocol}://${host}/talk/${role.elevenlabs_agent_id}`;

  const { error: updateError } = await supabase
    .from("roles")
    .update({ shareable_link: shareableLink })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ shareable_link: shareableLink });
}
