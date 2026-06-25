import type { ReactNode } from "react";
import { Columns3 } from "lucide-react";

// Sample board that mirrors the product's real task statuses — the panel previews
// what you're signing in to rather than decorating the page.
const COLUMNS = [
  {
    name: "Draft",
    accent: false,
    cards: [
      { title: "Draft Q3 roadmap", dot: "bg-amber-400", who: "AP" },
      { title: "Outline onboarding flow", dot: "bg-sky-400", who: "JL" },
    ],
  },
  {
    name: "In progress",
    accent: true,
    cards: [
      { title: "Wire up auth cookies", dot: "bg-[#8B7CF6]", who: "AP" },
      { title: "Design board columns", dot: "bg-rose-400", who: "MR" },
    ],
  },
  {
    name: "Done",
    accent: false,
    cards: [
      { title: "Set up Postgres schema", dot: "bg-emerald-400", who: "AP" },
    ],
  },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#8B7CF6] text-white">
        <Columns3 className="size-4.5" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-semibold tracking-tight">Taskly</span>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1A1726] to-[#0E0C15] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#8B7CF6] opacity-20 blur-3xl"
      />

      <Wordmark className="relative" />

      <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#A99BF8]">
          Your team&apos;s work, in motion
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
          Plan it, assign it, ship it.
        </h2>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {COLUMNS.map((col) => (
            <div
              key={col.name}
              className={`rounded-xl border p-3 ${
                col.accent
                  ? "border-[#8B7CF6]/40 bg-[#8B7CF6]/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">
                  {col.name}
                </span>
                <span className="font-mono text-[10px] text-white/40">
                  {col.cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5"
                  >
                    <p className="text-xs leading-snug text-white/90">
                      {card.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`size-2 rounded-full ${card.dot}`} />
                      <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-medium text-white/70">
                        {card.who}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="relative font-mono text-xs text-white/40">
        Draft → Pending → In progress → Completed
      </p>
    </aside>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Wordmark className="mb-8 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
