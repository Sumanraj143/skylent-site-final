import Link from "next/link";
import LogoutButton from "./LogoutButton";

export type PanelLink = { href: string; label: string };

export default function PanelShell({
  links,
  userName,
  roleLabel,
  children,
}: {
  links: PanelLink[];
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-shell">
      <header className="p-top">
        <Link href="/" className="p-brand" aria-label="SKYLENT home">
          <img src="/branding/skylent-navbar.png" alt="SKYLENT" />
        </Link>
        <nav className="p-nav" aria-label="Panel navigation">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-user">
          <span className="p-user-name">
            {userName}
            <small>{roleLabel}</small>
          </span>
          <LogoutButton className="p-btn p-btn-ghost p-btn-sm" />
        </div>
      </header>
      <main className="p-main">{children}</main>
    </div>
  );
}
