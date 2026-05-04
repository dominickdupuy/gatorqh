import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const WEBHOOK_URL = import.meta.env.VITE_INTEREST_FORM_WEBHOOK_URL as string;

type Year = "Freshman" | "Sophomore" | "Junior" | "Senior" | "Other";
type Interested = "Yes" | "No" | "";

interface FormState {
  fullName: string;
  email: string;
  year: Year | "";
  interested: Interested;
  yearOther: string;
}

export function InterestForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    year: "",
    interested: "",
    yearOther: "",
  });
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.year || !form.interested) return;

    const payload = {
      fullName: form.fullName,
      email: form.email,
      year: form.year === "Other" ? `Other: ${form.yearOther}` : form.year,
      interested: form.interested,
      submittedAt: new Date().toISOString(),
    };

    if (WEBHOOK_URL) {
      // fire-and-forget — no-cors means we'll never get a readable response anyway
      fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-mono text-white">You're on the list.</h2>
          <p className="text-gray-400 font-mono text-sm">
            We'll reach out to <span className="text-cyan-400">{form.email}</span> with next steps,
            timelines, and preparation resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden bg-[#001f3f] px-6 pb-8 pt-20 text-center md:pb-10 md:pt-24">
        <div
          className="absolute inset-0 opacity-45"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 24% 26%, rgba(156,201,255,0.5) 0 2px, transparent 2px), radial-gradient(circle at 72% 34%, rgba(250,70,22,0.28) 0 2px, transparent 2px), linear-gradient(rgba(99,246,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,246,255,0.05) 1px, transparent 1px)",
            backgroundSize: "280px 280px, 360px 360px, 34px 34px, 34px 34px",
          }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center">
          <p
            className="mb-4 text-center uppercase text-cyan-300"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(12px, 1.3vw, 16px)",
              fontWeight: 700,
              letterSpacing: "0.18em",
            }}
          >
            QuantEd Presents
          </p>
          <div className="mb-5 h-px w-full max-w-[620px] bg-gradient-to-r from-transparent via-[#FA4616]/70 to-transparent" />
          <h1
            className="mb-4 text-center uppercase text-white"
            style={{
              fontFamily: "var(--font-title)",
              fontSize: "clamp(36px, 5.8vw, 64px)",
              fontWeight: 400,
              letterSpacing: "0.04em",
              wordSpacing: "-0.12em",
              lineHeight: 0.95,
              textShadow:
                "0 3px 0 #173a65, 0 8px 0 rgba(0,0,0,0.28), 0 0 24px rgba(99,246,255,0.22)",
            }}
          >
            Interest Form
          </h1>
          <p
            className="mx-auto max-w-[760px] text-center text-[#d7dee8]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(14px, 1.6vw, 18px)",
              lineHeight: 1.55,
            }}
          >
            Gauge your interest in the{" "}
            <span className="font-bold text-cyan-300">
              Gator Quant Competition
            </span>
            . We'll share next steps, timelines, and prep resources.
          </p>
          <div className="mt-4 h-px w-full max-w-[620px] bg-gradient-to-r from-transparent via-[#FA4616]/70 to-transparent" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white font-mono">
                Full Name <span className="text-cyan-400">*</span>
              </Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="bg-black text-white shadow-none focus-visible:ring-cyan-400/40"
                placeholder="Jane Smith"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-mono">
                Email <span className="text-cyan-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-black text-white shadow-none focus-visible:ring-cyan-400/40"
                placeholder="you@university.edu"
              />
            </div>

            {/* Year */}
            <div className="space-y-3">
              <Label className="text-white font-mono">
                Year <span className="text-cyan-400">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(["Freshman", "Sophomore", "Junior", "Senior", "Other"] as Year[]).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setForm({ ...form, year: y })}
                    className={`px-4 py-2 rounded border font-mono text-sm transition-all ${
                      form.year === y
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
              {form.year === "Other" && (
                <Input
                  required
                  value={form.yearOther}
                  onChange={(e) => setForm({ ...form, yearOther: e.target.value })}
                  className="mt-2 bg-black text-white shadow-none focus-visible:ring-cyan-400/40"
                  placeholder="Please specify..."
                />
              )}
            </div>

            {/* Interest */}
            <div className="space-y-3">
              <Label className="block text-white font-mono leading-snug">
                Would you be interested in attending our Gator Quant{" "}
                <span className="whitespace-nowrap">
                  Competition?<span className="ml-1 text-cyan-400">*</span>
                </span>
              </Label>
              <div className="flex gap-3">
                {(["Yes", "No"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, interested: opt })}
                    className={`flex-1 py-3 rounded border font-mono text-sm transition-all ${
                      form.interested === opt
                        ? opt === "Yes"
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                          : "border-red-500/60 bg-red-500/10 text-red-400"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!form.year || !form.interested}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 font-bold text-lg py-6 shadow-[0_0_20px_rgba(0,188,212,0.3)] hover:shadow-[0_0_30px_rgba(0,188,212,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Interest
          </Button>
        </form>
      </div>
    </div>
  );
}
