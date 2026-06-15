import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  LibraryBig,
  Settings,
  Upload,
  WandSparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Repository", href: "/dashboard/questions", icon: LibraryBig },
  { label: "Papers", href: "/dashboard/papers", icon: FileText },
  { label: "Templates", href: "/dashboard/templates", icon: WandSparkles },
  { label: "Uploads", href: "/dashboard", icon: Upload },
  { label: "Settings", href: "/dashboard", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border p-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              AO
            </div>
            <div>
              <p className="text-sm font-semibold">AssessmentOS</p>
              <p className="text-xs text-muted-foreground">Riverside School</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Workspace
            </p>
            <p className="mt-1 text-sm font-semibold">Academic coordination</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
