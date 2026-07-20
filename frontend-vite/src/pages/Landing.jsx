import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  BrainCircuit,
  GitPullRequest,
  Zap,
  Network,
  Terminal,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const features = [
  {
    icon: Shield,
    title: "Security Agent",
    description:
      "Semgrep-backed static analysis plus LLM reasoning to catch injection, secrets, and unsafe patterns.",
  },
  {
    icon: Zap,
    title: "Performance Agent",
    description:
      "Flags algorithmic complexity, N+1 patterns, and latency risks before they hit production.",
  },
  {
    icon: BrainCircuit,
    title: "Risk & Impact",
    description:
      "Deployment risk scoring with blast-radius analysis across affected systems.",
  },
  {
    icon: Terminal,
    title: "Fix Agent",
    description:
      "Synthesizes actionable patches with explanations your team can review and apply.",
  },
];

const architecture = [
  { step: "01", title: "Ingest", detail: "GitHub PR webhook or manual repo URL" },
  { step: "02", title: "Scan", detail: "Semgrep static analysis seed findings" },
  { step: "03", title: "Agents", detail: "LangGraph sequential multi-agent review" },
  { step: "04", title: "Report", detail: "Findings, risk score, and patch suggestions" },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45 },
};

export default function Landing() {
  return (
    <div className="bg-mesh min-h-screen text-slate-100">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-6 py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Multi-agent code review
            </div>

            <h1 className="font-display mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              CODEGUARD{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Enterprise security reviews that ship with every pull request —
              risk scores, impact analysis, and AI-generated patches in one
              dashboard.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/analyze">
                <Button size="lg">
                  Analyze a repository
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="secondary">
                  Open dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-16 grid gap-4 sm:grid-cols-3"
          >
            {[
              { label: "Agents", value: "6", icon: Network },
              { label: "PR automation", value: "Live", icon: GitPullRequest },
              { label: "Patch synthesis", value: "Ready", icon: Terminal },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </div>
                  <div className="text-xl font-semibold text-white">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product overview */}
      <section id="product" className="mx-auto max-w-7xl px-6 py-20">
        <motion.div {...fade} className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Product overview
          </div>
          <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
            From webhook to actionable review
          </h2>
          <p className="mt-4 text-slate-400">
            CODEGUARD AI connects to your GitHub workflow, runs a LangGraph
            agent pipeline, and surfaces security findings with deployment risk
            — without changing how your backend already works.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            "Poll latest PR review payloads every 15 seconds",
            "Paste a public GitHub URL for on-demand repo scans",
            "Severity-ranked security and performance findings",
            "AI patch suggestions with line-level diffs",
          ].map((item) => (
            <motion.div
              key={item}
              {...fade}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
              <span className="text-sm text-slate-300">{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-white/5 bg-slate-950/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div {...fade} className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Features
            </div>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Built for security engineering teams
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fade}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="mx-auto max-w-7xl px-6 py-20">
        <motion.div {...fade} className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Architecture
          </div>
          <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
            LangGraph review pipeline
          </h2>
          <p className="mt-4 text-slate-400">
            A sequential agent graph that turns static scan signals into risk,
            impact, and fix recommendations.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {architecture.map((item, i) => (
            <motion.div key={item.step} {...fade} transition={{ delay: i * 0.06 }}>
              <Card accent className="h-full">
                <div className="font-display text-3xl font-bold text-cyan-400/80">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          {...fade}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950 p-10 sm:p-14"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to guard your next merge?
            </h2>
            <p className="mt-4 text-slate-300">
              Open the dashboard to watch live PR reviews, or paste a repository
              URL to run an on-demand multi-agent scan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button size="lg">Go to dashboard</Button>
              </Link>
              <Link to="/analyze">
                <Button size="lg" variant="secondary">
                  Analyze repository
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
