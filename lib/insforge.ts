import { createClient } from "@insforge/sdk";

const insforgeUrl =
  process.env.NEXT_PUBLIC_INSFORGE_URL ||
  "https://g794t578.us-east.insforge.app";
const insforgeAnonKey =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  "ik_a8615d163b8d7e4e90e5f24f2d8fd37c";

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
