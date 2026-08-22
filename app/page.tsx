import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EntryPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("skylent_session");

  if (session) {
    redirect("/home");
  }

  redirect("/login");
}