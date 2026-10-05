import { redirect } from "next/navigation";

// Old address. The home page now lives at "/" and is public.
export default function OldHome() {
  redirect("/");
}
