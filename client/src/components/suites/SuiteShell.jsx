import React from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsLightningCharge } from "react-icons/bs";
import { suiteCatalog } from "../../data/suiteCatalog";

function ScoreMeter({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-black text-slate-950">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function SuiteShell({ suiteKey }) {
  const navigate = useNavigate();
  const suite =
    suiteCatalog.find((item) => item.key === suiteKey) || suiteCatalog[0];
  const Icon = suite.icon;

  return (
    <div className="page-shell min-h-screen">
      <div className="wide-shell py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-secondary h-11 w-11 min-h-0 rounded-full p-0"
              aria-label="Back to dashboard"
            >
              <BsArrowLeft />
            </button>
            <div>
              <p className="eyebrow mb-3">
                <Icon /> HirePilot AI suite
              </p>
              <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">
                {suite.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
                A focused workspace for the suite features, API workflows, score
                tracking, and next actions defined for the career platform.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/career")}
            className="btn-primary w-fit px-5 py-3"
          >
            <BsLightningCharge /> Back to Career Hub
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="surface-card p-5 sm:p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Icon size={22} />
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              Suite capabilities
            </h2>
            <div className="mt-5 grid gap-3">
              {suite.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <ScoreMeter label={suite.scoreLabel} value={suite.score} />
            <div className="surface-card p-5 sm:p-6">
              <h2 className="text-2xl font-black text-slate-950">
                Recommended next actions
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {suite.actions.map((action) => (
                  <button
                    key={action}
                    className="rounded-xl bg-slate-950 p-4 text-left text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {suiteCatalog
                .filter((item) => item.key !== suite.key)
                .slice(0, 4)
                .map((item) => {
                  const RelatedIcon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(item.path)}
                      className="surface-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                        <RelatedIcon />
                      </div>
                      <p className="font-black text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.scoreLabel}: {item.score}%
                      </p>
                    </button>
                  );
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SuiteShell;
