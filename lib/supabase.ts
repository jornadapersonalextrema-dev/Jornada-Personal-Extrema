import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Variáveis do Supabase ausentes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isValidAdminToken(token: string | null) {
  return Boolean(process.env.ADMIN_SURVEY_TOKEN && token === process.env.ADMIN_SURVEY_TOKEN);
}

function getAllowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAuthorizedAdminRequest(request: Request) {
  const url = new URL(request.url);

  if (isValidAdminToken(url.searchParams.get("token"))) {
    return true;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!accessToken) return false;

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) return false;

  const allowedEmails = getAllowedEmails();
  if (allowedEmails.length === 0) {
    return true;
  }

  const userEmail = data.user.email?.toLowerCase() ?? "";
  return allowedEmails.includes(userEmail);
}
