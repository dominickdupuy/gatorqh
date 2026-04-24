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
      {/* Header */}
      <div className="bg-[#001f3f] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-4">
            QuantEd Presents
          </p>
          <h1 className="text-4xl md:text-5xl text-white font-mono mb-4">
            Interest Form
          </h1>
          <p className="text-gray-300 text-lg">
            Gauge your interest in the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Gator Quant Competition
            </span>
            . We'll share next steps, timelines, and prep resources.
          </p>
        </div>
      </div>

      {/* Form */}
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
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
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
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
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
                  className="bg-black border-gray-700 text-white focus:border-cyan-400 mt-2"
                  placeholder="Please specify..."
                />
              )}
            </div>

            {/* Interest */}
            <div className="space-y-3">
              <Label className="text-white font-mono">
                Would you be interested in attending our Gator Quant Competition?{" "}
                <span className="text-cyan-400">*</span>
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
