import { createUsernameLoginHandler } from './handler.ts';

const url = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!url || !anonKey || !serviceRoleKey) {
  throw new Error('username-login: required server configuration is missing');
}

Deno.serve(
  createUsernameLoginHandler({
    url,
    anonKey,
    serviceRoleKey,
    devDisableCaptcha: Deno.env.get('DEV_DISABLE_CAPTCHA'),
  }),
);
