import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
    };

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Full name, email and password are required." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ user: null });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Build response including session info so the client can decide where
    // to navigate. `data.session` will be null when email confirmation is
    // required, which is the case on many Supabase projects.
    const out = NextResponse.json({ user: data.user, session: data.session });
    try {
      const existing = response.cookies.getAll();
      existing.forEach(({ name, value, options }) =>
        out.cookies.set(name, value, options),
      );
    } catch {
      // ignore if cookies API isn't available
    }

    return out;
  } catch (err) {
    console.error("Auth signup route error", err);
    const message =
      err instanceof Error ? err.message : "Unexpected error while signing up.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
