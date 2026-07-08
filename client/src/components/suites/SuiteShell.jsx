import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsLightningCharge, BsPlayFill } from "react-icons/bs";
import { suiteCatalog } from "../../data/suiteCatalog";
import {
  buildSuitePrompt,
  createInitialInputs,
  getSuiteFields,
  runSuiteFeature,
} from "../../data/suiteTools";
import {
  getDashboardState,
  recordSuiteScore,
  subscribeDashboardState,
} from "../../utils/dashboardStore";

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
  const fields = useMemo(() => getSuiteFields(suite.key), [suite.key]);
  const [activeFeature, setActiveFeature] = useState(suite.features[0]);
  const [inputs, setInputs] = useState(() => createInitialInputs(suite.key));
  const [outputs, setOutputs] = useState({});
  const [dashboardState, setDashboardState] = useState(() => getDashboardState());

  const prompt = buildSuitePrompt({ suite, feature: activeFeature, inputs });
  const activeOutput = outputs[activeFeature];
  const suiteScore = dashboardState.suiteScores[suite.key] ?? suite.score;

  React.useEffect(() => subscribeDashboardState(setDashboardState), []);

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const runFeature = () => {
    const result = runSuiteFeature({ suite, feature: activeFeature, inputs });
    setOutputs((current) => ({ ...current, [activeFeature]: result }));
    recordSuiteScore({
      suiteKey: suite.key,
      suiteTitle: suite.title,
      feature: activeFeature,
      score: result.score,
    });
  };

  const switchFeature = (feature) => {
    setActiveFeature(feature);
  };

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

        <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
          <aside className="surface-card p-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Icon size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-950">
              Suite tools
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Pick a feature, add your context, and run the workflow.
            </p>
            <div className="mt-5 grid gap-2">
              {suite.features.map((feature) => (
                <button
                  key={feature}
                  onClick={() => switchFeature(feature)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition ${
                    activeFeature === feature
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      : "bg-slate-50 text-slate-700 ring-1 ring-slate-100 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <ScoreMeter label={suite.scoreLabel} value={suiteScore} />
            </div>
          </aside>

          <section className="space-y-5">
            <div className="surface-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="eyebrow mb-3">Active feature</p>
                  <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
                    {activeFeature}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                    Enter your details and run this feature. The generated prompt
                    is shown so the same workflow can be sent to Gemini or
                    OpenRouter from the backend.
                  </p>
                </div>
                <button onClick={runFeature} className="btn-primary w-fit px-5 py-3">
                  <BsPlayFill /> Run feature
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {fields.map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    <textarea
                      value={inputs[key] || ""}
                      onChange={(event) => updateInput(key, event.target.value)}
                      placeholder={placeholder}
                      className="input-field min-h-28 p-3 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
              <div className="surface-card p-5 sm:p-6">
                <h3 className="text-xl font-black text-slate-950">
                  Output
                </h3>
                {activeOutput ? (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-xl bg-slate-950 p-5 text-white">
                      <p className="text-sm font-bold text-emerald-200">
                        Result score
                      </p>
                      <p className="mt-2 text-4xl font-black">
                        {activeOutput.score}%
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {activeOutput.summary}
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-black text-slate-700">
                        Generated work
                      </p>
                      <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-100">
                        {activeOutput.generatedContent}
                      </pre>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {[
                        ["Recommendations", activeOutput.recommendations],
                        ["Next actions", activeOutput.nextActions],
                        ["Risks", activeOutput.risks],
                      ].map(([title, items]) => (
                        <div key={title} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                          <p className="font-black text-slate-950">{title}</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {items.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      Generated at {activeOutput.generatedAt}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-500 ring-1 ring-slate-100">
                    Run the feature to generate a score, analysis, recommendations,
                    next actions, and a ready-to-send AI prompt.
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="surface-card p-5 sm:p-6">
                  <h3 className="text-xl font-black text-slate-950">
                    AI prompt
                  </h3>
                  <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                    {activeOutput?.prompt || prompt}
                  </pre>
                </div>
                <div className="surface-card p-5 sm:p-6">
                  <h3 className="text-xl font-black text-slate-950">
                    Recommended next actions
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {suite.actions.map((action) => (
                      <button
                        key={action}
                        onClick={runFeature}
                        className="rounded-xl bg-slate-950 p-4 text-left text-sm font-black text-white transition hover:bg-emerald-700"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
