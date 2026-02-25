import Link from "next/link";
import Image from "next/image";

export function Navbar({
  title,
  backHref = "/",
  actions,
}: {
  title: string;
  backHref?: string;
  actions?: { label: string; href: string }[];
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#1a1a1a] to-[#151515] border-b border-white/[0.08]">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#252525] border border-[#333] text-gray-500 hover:text-white hover:border-[#444] transition-all text-lg"
        >
          ⌂
        </Link>
        <span className="text-base font-semibold text-white">{title}</span>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="px-3.5 py-2 rounded-md bg-[#252525] border border-[#333] text-gray-500 text-[13px] hover:text-white hover:border-[#444] transition-all"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  showIcon = false,
}: {
  title: string;
  subtitle: string;
  showIcon?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 mb-6 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.03]">
      {showIcon && (
        <Image
          src="/icon-192x192.png"
          alt="EZBaths"
          width={40}
          height={40}
          className="rounded-lg"
        />
      )}
      <div className="text-center flex-1">
        <h1 className="text-[22px] font-semibold text-white">{title}</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mt-6 mb-3 pl-1 first:mt-0">
      {children}
    </h3>
  );
}

export function ToolCard({
  href,
  icon,
  iconType = "emoji",
  title,
  description,
  external = false,
  onClick,
}: {
  href?: string;
  icon: string;
  iconType?: "emoji" | "svg";
  title: string;
  description: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-[10px] bg-[#252525]">
        {iconType === "svg" ? (
          <Image src={icon} alt="" width={28} height={28} className="opacity-90" />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </>
  );

  const className =
    "flex items-center gap-4 px-5 py-[18px] rounded-[10px] border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] text-white transition-all duration-200 hover:from-[#282828] hover:to-[#222] hover:border-[#3a3a3a] hover:-translate-y-0.5 active:translate-y-0";

  if (onClick) {
    return (
      <button onClick={onClick} className={className + " w-full text-left cursor-pointer"}>
        {inner}
      </button>
    );
  }

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href || "#"} className={className}>
      {inner}
    </Link>
  );
}

export function BackLink({ href = "/", label = "Back" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-300 transition-colors mb-4"
    >
      <span>←</span> {label}
    </Link>
  );
}

export function PageFooter() {
  return (
    <footer className="text-center mt-8 pt-5 border-t border-white/[0.06]">
      <p className="text-[11px] text-gray-600">&copy; {new Date().getFullYear()} XRKR80HD Design</p>
    </footer>
  );
}
