import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // create one response object up front; we'll attach any cookies
    // the Supabase client produces directly to it.
    const response = NextResponse.json({ user: null, session: null });
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // collect cookies set by Supabase
    const cookieList = response.cookies.getAll();
    console.log("login cookies set by supabase", cookieList);

    // return body including cookie info for debugging purposes
    const out = NextResponse.json({
      user: data.user,
      session: data.session,
      cookies: cookieList,
    });
    // copy cookies to outgoing response
    cookieList.forEach(({ name, value, options }) =>
      out.cookies.set(name, value, options),
    );
    return out;
  } catch (err) {
    console.error("Auth login route error", err);
    const message =
      err instanceof Error ? err.message : "Unexpected error while logging in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
