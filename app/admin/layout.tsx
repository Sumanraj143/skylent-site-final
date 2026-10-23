import PanelShell from "@/components/PanelShell";
import { isDevAdminBypass, requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <PanelShell
      userName={admin.name}
      roleLabel="Admin"
      links={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/batches", label: "Workshops" },
        { href: "/admin/students", label: "Students" },
        { href: "/admin/projects", label: "AI projects" },
        { href: "/admin/plan", label: "4-day plan" },
      ]}
    >
      {isDevAdminBypass() && (
        <div className="p-notice">
          Local test mode: admin opens without sign-in (DEV_ADMIN_BYPASS=true in .env.local). This never works on the live site.
        </div>
      )}
      {children}
    </PanelShell>
  );
}
