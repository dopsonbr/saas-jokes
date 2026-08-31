import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  Database,
  FilePenLine,
  KeyRound,
  Laugh,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Unlink,
} from 'lucide-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const appUrl = import.meta.env.VITE_APP_URL || '#'

const workflow = [
  {
    icon: FilePenLine,
    step: '01',
    title: 'Build the bit',
    text: 'Structure the setup, punchline, title, and tags in one focused editor.',
  },
  {
    icon: Building2,
    step: '02',
    title: 'Align the organization',
    text: 'Keep drafts in a Clerk-backed team workspace instead of scattered documents.',
  },
  {
    icon: Copy,
    step: '03',
    title: 'Share with control',
    text: 'Publish an unlisted link, copy it anywhere, and revoke it when the moment passes.',
  },
]

function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaff] text-slate-950">
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-3 font-bold"
          aria-label="Punchline HQ home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Laugh className="h-5 w-5" />
          </span>
          Punchline HQ
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="#how"
            className="hidden text-sm font-medium text-slate-600 hover:text-violet-700 sm:block"
          >
            How it works
          </a>
          <a
            href={appUrl}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-violet-200 hover:text-violet-700"
          >
            Open workspace
          </a>
        </div>
      </nav>

      <main id="top">
        <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="absolute left-1/2 top-0 -z-0 h-[34rem] w-[54rem] -translate-x-1/2 rounded-full bg-violet-200/45 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-violet-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" /> Now operationalizing humor
            </div>
            <h1 className="mt-7 text-5xl font-black tracking-[-0.05em] sm:text-7xl lg:text-[5.6rem] lg:leading-[0.95]">
              Mission-critical
              <span className="block bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent">
                punchlines, managed.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Punchline HQ gives business teams one secure place to draft,
              organize, publish, and revoke jokes—before someone sends version
              twelve of “final-final-joke.docx.”
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={appUrl}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                Open the joke pipeline <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold shadow-sm transition hover:border-violet-200"
              >
                See the operating model
              </a>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-16 max-w-5xl rounded-[2rem] border border-white/80 bg-slate-950 p-3 shadow-2xl shadow-violet-300/40 sm:p-5">
            <div className="grid overflow-hidden rounded-[1.4rem] bg-white lg:grid-cols-[0.42fr_1fr]">
              <div className="border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3 font-bold">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-600 text-white">
                    <Laugh className="h-4 w-4" />
                  </span>
                  Joke portfolio
                </div>
                <div className="mt-8 space-y-3 text-sm">
                  {[
                    'All jokes  24',
                    'Drafts  7',
                    'Published  12',
                    'Archived  5',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2.5 ${index === 0 ? 'bg-violet-100 font-semibold text-violet-700' : 'text-slate-500'}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 sm:p-9">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      published
                    </span>
                    <h2 className="mt-4 text-xl font-bold">
                      The alignment meeting
                    </h2>
                  </div>
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-7 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 p-7 text-white">
                  <p className="text-lg font-medium">
                    Why did the roadmap attend the all-hands?
                  </p>
                  <div className="my-5 h-px bg-white/30" />
                  <p className="text-2xl font-bold">
                    It needed more alignment.
                  </p>
                </div>
                <div className="mt-5 flex gap-2">
                  <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                    Copy link
                  </span>
                  <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                    Revoke
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                Controlled comedy lifecycle
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                From blank page to shared laugh.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                A deliberately boring operating model for a deliberately
                ridiculous product.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {workflow.map(({ icon: Icon, step, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-[#fbfaff] p-7 transition hover:border-violet-200 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-sm text-slate-400">
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
              <ShieldCheck className="h-4 w-4" /> Security that can take a joke
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              One business. One isolated joke cell.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Clerk handles identity. A dedicated Hono API enforces the
              organization boundary. Neon stores the material. Public links
              reveal only the published joke and can be revoked without deleting
              the draft.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-medium text-slate-700">
              {[
                'Organization-pinned Clerk sessions',
                'Dedicated API and database credentials',
                'No joke payloads in shared telemetry',
                'Revocable, unlisted public URLs',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-950 p-7 text-slate-300 shadow-2xl">
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <KeyRound className="h-4 w-4 text-violet-300" /> Shared Clerk
                identity
              </div>
              <div className="pl-8 text-slate-500">
                ↓ organization-bound JWT
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <LockKeyhole className="h-4 w-4 text-violet-300" /> Dedicated
                Hono API
              </div>
              <div className="pl-8 text-slate-500">↓ private connection</div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <Database className="h-4 w-4 text-violet-300" /> Dedicated Neon
                database
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300">
                <Unlink className="h-4 w-4" /> Share revoked successfully
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-violet-600 px-6 py-16 text-center text-white shadow-2xl shadow-violet-200 sm:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-200">
              No committee required
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Give every punchline a single source of truth.
            </h2>
            <a
              href={appUrl}
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-6 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Enter Punchline HQ <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Punchline HQ</span>
          <span>Built to evaluate the SaaS Cell Starter—seriously.</span>
        </div>
      </footer>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing root element')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
