import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const answers = body?.answers || {};
    const analysis = body?.analysis || null;

    const payload = {
      answers: {
        answer1: answers.answer1 || "",
        answer2: answers.answer2 || "",
        answer3: answers.answer3 || "",
        note: (answers.note || "").slice(0, 500),
      },
      analysis,
      text_sample: (body.text_sample || "").slice(0, 280),
      ts: body.ts || Date.now(),
    };

    console.log("ZENITH_FEEDBACK", JSON.stringify(payload));

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Feedback parse/validation error" },
      { status: 400 }
    );
  }
}
