import { Link } from "react-router-dom";
import { Shield, Code2, BookOpen, Mail } from "lucide-react";

const GITHUB_URL = "https://github.com/surajsingh8204";
const CONTACT_EMAIL = "surajsingh8204@gmail.com";

const links = {
  product: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Analyze", to: "/analyze" },
    { label: "PR Review", to: "/pull-requests" },
    { label: "Results", to: "/results" },
  ],
  contact: [
    { label: "GitHub · surajsingh8204", href: GITHUB_URL },
    { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { label: "Settings", to: "/settings" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              CODEGUARD AI
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Enterprise multi-agent code review for security, performance, risk,
            and automated patch suggestions — powered by LangGraph and Semgrep.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
              aria-label="GitHub profile"
            >
              <Code2 className="h-4 w-4" />
              surajsingh8204
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
              aria-label="Email contact"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
              aria-label="Dashboard"
            >
              <BookOpen className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Product
          </div>
          <ul className="mt-4 space-y-2">
            {links.product.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-slate-400 transition hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Contact
          </div>
          <ul className="mt-4 space-y-2">
            {links.contact.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="break-all text-sm text-slate-400 transition hover:text-cyan-300"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CODEGUARD AI · Built by{" "}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400/80 hover:text-cyan-300"
        >
          surajsingh8204
        </a>
        {" · "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-cyan-400/80 hover:text-cyan-300"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
