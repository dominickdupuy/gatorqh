import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const WEBHOOK_URL = import.meta.env.VITE_INTEREST_FORM_WEBHOOK_URL as string;

const MAX_RESUME_BYTES = 4 * 1024 * 1024;
const ACCEPTED_RESUME_TYPES = '.pdf,.doc,.docx';

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad', 'Other'] as const;
const EXPERIENCE_LEVELS = [
  { value: 'None', hint: 'Never traded or modeled. Here to learn.' },
  { value: 'Some', hint: 'Coursework, personal projects, or a club.' },
  { value: 'Strong', hint: 'Internships, research, or competition wins.' },
] as const;

type Year = (typeof YEARS)[number];
type Experience = (typeof EXPERIENCE_LEVELS)[number]['value'];

type ResumeFile = {
  filename: string;
  mimeType: string;
  size: number;
  dataBase64: string;
};

interface FormState {
  fullName: string;
  email: string;
  school: string;
  year: Year | '';
  yearOther: string;
  experience: Experience | '';
  whyInterested: string;
  themedAnswer: string;
  resume: ResumeFile | null;
}

const EMPTY_FORM: FormState = {
  fullName: '',
  email: '',
  school: 'University of Florida',
  year: '',
  yearOther: '',
  experience: '',
  whyInterested: '',
  themedAnswer: '',
  resume: null,
};

const THEMED_QUESTION =
  'You are stranded on a space station with one trading terminal, 400 credits, and a vending machine that only accepts alligator teeth. What is your play?';

const STEPS = [
  { id: 'identity', level: 'LEVEL 1', title: 'IDENTIFY YOUR PLAYER' },
  { id: 'loadout', level: 'LEVEL 2', title: 'CHOOSE YOUR LOADOUT' },
  { id: 'motivation', level: 'LEVEL 3', title: 'STATE YOUR MISSION' },
  { id: 'bonus', level: 'BONUS ROUND', title: 'THE ABSURD SCENARIO' },
  { id: 'review', level: 'FINAL STAGE', title: 'CONFIRM AND LAUNCH' },
] as const;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const countWords = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

/**
 * Apps Script web apps do not answer CORS preflights, so the request must stay
 * "simple": a text/plain body with no custom headers. We try a readable `cors`
 * request first (the /exec endpoint redirects to a googleusercontent.com
 * response that does send Access-Control-Allow-Origin) and fall back to an
 * opaque `no-cors` post if the browser refuses to expose the response.
 */
const postApplication = async (payload: unknown) => {
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
    return 'confirmed' as const;
  } catch {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    return 'sent' as const;
  }
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const validateStep = (stepId: (typeof STEPS)[number]['id'], form: FormState): FieldErrors => {
  const errors: FieldErrors = {};

  if (stepId === 'identity') {
    if (!form.fullName.trim()) errors.fullName = 'Enter your name so we know who is playing.';
    if (!form.email.trim()) errors.email = 'We need an email to send your entry pass.';
    else if (!isValidEmail(form.email)) errors.email = 'That email address looks incomplete.';
    if (!form.school.trim()) errors.school = 'Tell us where you study.';
    if (!form.year) errors.year = 'Pick your year.';
    else if (form.year === 'Other' && !form.yearOther.trim()) {
      errors.yearOther = 'Describe your year.';
    }
  }

  if (stepId === 'loadout') {
    if (!form.experience) errors.experience = 'Pick the level that fits you best.';
    if (!form.resume) errors.resume = 'Attach a resume to continue.';
  }

  if (stepId === 'motivation') {
    if (countWords(form.whyInterested) < 20) {
      errors.whyInterested = 'Give us at least 20 words.';
    }
  }

  if (stepId === 'bonus') {
    if (countWords(form.themedAnswer) < 10) {
      errors.themedAnswer = 'At least 10 words. Have fun with it.';
    }
  }

  return errors;
};

export function ApplicationForm() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusHeading = useRef(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }, []);

  // Move focus to the new step heading so keyboard and screen reader users are
  // not left focused on a button that no longer exists.
  useEffect(() => {
    if (!shouldFocusHeading.current) return;
    shouldFocusHeading.current = false;
    headingRef.current?.focus();
  }, [stepIndex]);

  const goToStep = useCallback((nextIndex: number) => {
    shouldFocusHeading.current = true;
    setStepIndex(nextIndex);
  }, []);

  const goNext = useCallback(() => {
    const stepErrors = validateStep(step.id, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const firstInvalid = document.querySelector<HTMLElement>('[data-invalid="true"]');
      firstInvalid?.focus();
      return;
    }
    setErrors({});
    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  }, [form, goToStep, step.id, stepIndex]);

  const goBack = useCallback(() => {
    setErrors({});
    goToStep(Math.max(stepIndex - 1, 0));
  }, [goToStep, stepIndex]);

  const handleSubmit = useCallback(async () => {
    // Re-check every step: a user can reach review, then edit an earlier step.
    for (const candidate of STEPS) {
      const stepErrors = validateStep(candidate.id, form);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        goToStep(STEPS.findIndex((entry) => entry.id === candidate.id));
        return;
      }
    }

    setStatus('submitting');
    setSubmitError('');

    const payload = {
      formType: 'application',
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      school: form.school.trim(),
      year: form.year === 'Other' ? `Other: ${form.yearOther.trim()}` : form.year,
      experience: form.experience,
      whyInterested: form.whyInterested.trim(),
      themedQuestion: THEMED_QUESTION,
      themedAnswer: form.themedAnswer.trim(),
      resumeFilename: form.resume?.filename ?? '',
      resumeMimeType: form.resume?.mimeType ?? '',
      resumeBase64: form.resume?.dataBase64 ?? '',
      // Kept so rows written by the older interest form stay comparable.
      interested: 'Yes',
      submittedAt: new Date().toISOString(),
    };

    try {
      const result = await postApplication(payload);
      setConfirmed(result === 'confirmed');
      setStatus('success');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'The submission could not be delivered.',
      );
      setStatus('error');
    }
  }, [form, goToStep]);

  // Enter advances the wizard from any single-line input; textareas keep their
  // newline behaviour and only submit via the explicit button.
  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
    // A focused file input must keep Enter so it can open the file picker.
    if (target instanceof HTMLInputElement && target.type === 'file') return;
    event.preventDefault();
    if (isLastStep) void handleSubmit();
    else goNext();
  };

  if (status === 'success') {
    return <SuccessScreen email={form.email.trim()} confirmed={confirmed} />;
  }

  return (
    <div className="relative min-h-screen bg-[#050508] px-6 pb-24 pt-28 md:pt-32">
      <FormStyles />

      <div className="mx-auto w-full max-w-[860px]">
        <header className="mb-8 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 border border-[#294f7d] bg-[#0b1524]/92 px-4 py-2 text-[#9cc9ff]"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1.5px',
            }}
          >
            APPLICATIONS OPEN
          </div>
          <h1
            className="mb-3 uppercase text-white"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(20px, 3.4vw, 34px)',
              lineHeight: 1.35,
              textShadow: '0 0 24px rgba(4,74,148,0.35)',
            }}
          >
            Enter The Arena
          </h1>
          <p
            className="mx-auto max-w-[620px] text-[rgba(255,255,255,0.66)]"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', lineHeight: 1.65 }}
          >
            Gator Quant Hacks &mdash; October 2&ndash;4, 2026. Five short stages, about three
            minutes. Press <kbd className="gqh-kbd">Enter</kbd> to advance.
          </p>
        </header>

        <StepIndicator stepIndex={stepIndex} onJump={goToStep} />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          onKeyDown={handleFormKeyDown}
          noValidate
          className="gqh-panel relative mt-6 border-2 border-[#294f7d] bg-[#0B0D14]/95 p-6 md:p-9"
        >
          <PanelCorners />

          <div aria-live="polite" className="sr-only">
            {`Stage ${stepIndex + 1} of ${STEPS.length}: ${step.title}`}
          </div>

          <div className="mb-6 border-b border-[#173154] pb-5">
            <div
              className="mb-2 text-[#FA4616]"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              {step.level}
            </div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="uppercase text-white outline-none focus-visible:ring-2 focus-visible:ring-[#9cc9ff]"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(18px, 2.2vw, 24px)',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              {step.title}
            </h2>
          </div>

          {step.id === 'identity' && (
            <IdentityStep form={form} errors={errors} update={update} />
          )}

          {step.id === 'loadout' && (
            <LoadoutStep
              form={form}
              errors={errors}
              update={update}
              fileInputRef={fileInputRef}
              setErrors={setErrors}
            />
          )}

          {step.id === 'motivation' && (
            <TextareaStep
              id="whyInterested"
              label="Why do you want to compete in Gator Quant Hacks?"
              help="Tell us what pulls you in — the markets, the modeling, the 36-hour sprint, the people. Specifics beat polish."
              placeholder="I have been building backtests for momentum strategies since sophomore year, and..."
              minWords={20}
              value={form.whyInterested}
              error={errors.whyInterested}
              onChange={(value) => update('whyInterested', value)}
            />
          )}

          {step.id === 'bonus' && (
            <TextareaStep
              id="themedAnswer"
              label={THEMED_QUESTION}
              help="There is no right answer. We read every one of these, and the good ones get remembered."
              placeholder="First, I short the teeth market..."
              minWords={10}
              value={form.themedAnswer}
              error={errors.themedAnswer}
              onChange={(value) => update('themedAnswer', value)}
            />
          )}

          {step.id === 'review' && (
            <ReviewStep form={form} onEdit={goToStep} themedQuestion={THEMED_QUESTION} />
          )}

          {status === 'error' && (
            <p
              role="alert"
              className="mt-6 border border-[#7a2f18] bg-[#1a0c07] px-4 py-3 text-[#ff8a5c]"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', lineHeight: 1.6 }}
            >
              {submitError} Please try again, or email us at gatorquanthacks@gmail.com.
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#173154] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="gqh-btn-ghost"
            >
              &lt;&lt; BACK
            </button>

            <div className="flex items-center gap-3">
              <span
                className="hidden text-[rgba(255,255,255,0.4)] sm:inline"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
              >
                {stepIndex + 1} / {STEPS.length}
              </span>
              {isLastStep ? (
                <button type="submit" disabled={status === 'submitting'} className="gqh-btn-primary">
                  {status === 'submitting' ? 'TRANSMITTING...' : 'SUBMIT APPLICATION'}
                </button>
              ) : (
                <button type="button" onClick={goNext} className="gqh-btn-primary">
                  NEXT &gt;&gt;
                </button>
              )}
            </div>
          </div>
        </form>

        <p
          className="mt-6 text-center text-[rgba(255,255,255,0.38)]"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', lineHeight: 1.7 }}
        >
          Tab moves between fields &middot; Arrow keys pick options &middot; Enter advances a stage
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- steps --- */

type StepProps = {
  form: FormState;
  errors: FieldErrors;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

function IdentityStep({ form, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <TextField
        id="fullName"
        label="Full name"
        autoComplete="name"
        placeholder="Alex Rivera"
        value={form.fullName}
        error={errors.fullName}
        onChange={(value) => update('fullName', value)}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@ufl.edu"
        value={form.email}
        error={errors.email}
        onChange={(value) => update('email', value)}
      />
      <TextField
        id="school"
        label="School"
        autoComplete="organization"
        placeholder="University of Florida"
        value={form.school}
        error={errors.school}
        onChange={(value) => update('school', value)}
      />
      <RadioGroup
        label="Year"
        name="year"
        options={YEARS.map((year) => ({ value: year }))}
        value={form.year}
        error={errors.year}
        onChange={(value) => update('year', value as Year)}
      />
      {form.year === 'Other' && (
        <TextField
          id="yearOther"
          label="Tell us your year"
          placeholder="Fifth year, post-bacc, PhD candidate..."
          value={form.yearOther}
          error={errors.yearOther}
          onChange={(value) => update('yearOther', value)}
        />
      )}
    </div>
  );
}

function LoadoutStep({
  form,
  errors,
  update,
  fileInputRef,
  setErrors,
}: StepProps & {
  fileInputRef: React.RefObject<HTMLInputElement>;
  setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
}) {
  const [reading, setReading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_RESUME_BYTES) {
      setErrors((previous) => ({
        ...previous,
        resume: `That file is ${formatBytes(file.size)}. Keep it under ${formatBytes(MAX_RESUME_BYTES)}.`,
      }));
      return;
    }

    setReading(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      update('resume', {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataBase64,
      });
    } catch {
      setErrors((previous) => ({
        ...previous,
        resume: 'That file could not be read. Try a different one.',
      }));
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="space-y-7">
      <RadioGroup
        label="How much quant experience do you have?"
        help="This does not filter anyone out. It helps us balance teams and pitch workshops at the right level."
        name="experience"
        columns="one"
        options={EXPERIENCE_LEVELS.map((level) => ({ value: level.value, hint: level.hint }))}
        value={form.experience}
        error={errors.experience}
        onChange={(value) => update('experience', value as Experience)}
      />

      <div className="space-y-2">
        <span className="gqh-label">
          Resume <span className="text-[#FA4616]">*</span>
        </span>
        <p className="gqh-help">PDF, DOC, or DOCX up to {formatBytes(MAX_RESUME_BYTES)}.</p>

        <label
          className={`gqh-dropzone ${errors.resume ? 'gqh-dropzone--error' : ''}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleFile(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_RESUME_TYPES}
            className="gqh-file-input"
            data-invalid={errors.resume ? 'true' : undefined}
            aria-describedby={errors.resume ? 'resume-error' : undefined}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <span className="gqh-dropzone__body">
            {reading ? (
              <span className="gqh-dropzone__title">READING FILE...</span>
            ) : form.resume ? (
              <>
                <span className="gqh-dropzone__title text-[#4cff87]">
                  {form.resume.filename}
                </span>
                <span className="gqh-dropzone__hint">
                  {formatBytes(form.resume.size)} &middot; Click or press Enter to replace
                </span>
              </>
            ) : (
              <>
                <span className="gqh-dropzone__title">DROP RESUME HERE</span>
                <span className="gqh-dropzone__hint">or click to browse your files</span>
              </>
            )}
          </span>
        </label>

        {form.resume && (
          <button
            type="button"
            className="gqh-link-btn"
            onClick={() => {
              update('resume', null);
              if (fileInputRef.current) fileInputRef.current.value = '';
              fileInputRef.current?.focus();
            }}
          >
            Remove file
          </button>
        )}

        {errors.resume && (
          <p id="resume-error" role="alert" className="gqh-error">
            {errors.resume}
          </p>
        )}
      </div>
    </div>
  );
}

function TextareaStep({
  id,
  label,
  help,
  placeholder,
  minWords,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  placeholder: string;
  minWords: number;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const words = useMemo(() => countWords(value), [value]);
  const met = words >= minWords;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="gqh-label">
        {label} <span className="text-[#FA4616]">*</span>
      </label>
      <p className="gqh-help">{help}</p>
      <textarea
        id={id}
        rows={8}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        data-invalid={error ? 'true' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-count${error ? ` ${id}-error` : ''}`}
        className={`gqh-input gqh-textarea ${error ? 'gqh-input--error' : ''}`}
      />
      <div className="flex items-center justify-between">
        <span
          id={`${id}-count`}
          className={met ? 'text-[#4cff87]' : 'text-[rgba(255,255,255,0.45)]'}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
        >
          {words} {words === 1 ? 'word' : 'words'}
          {met ? ' — good to go' : ` · ${minWords} minimum`}
        </span>
        <span
          className="text-[rgba(255,255,255,0.3)]"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
        >
          Shift+Enter for a new line
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="gqh-error">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewStep({
  form,
  onEdit,
  themedQuestion,
}: {
  form: FormState;
  onEdit: (index: number) => void;
  themedQuestion: string;
}) {
  const rows = [
    { label: 'Name', value: form.fullName, step: 0 },
    { label: 'Email', value: form.email, step: 0 },
    { label: 'School', value: form.school, step: 0 },
    {
      label: 'Year',
      value: form.year === 'Other' ? `Other: ${form.yearOther}` : form.year,
      step: 0,
    },
    { label: 'Experience', value: form.experience, step: 1 },
    { label: 'Resume', value: form.resume?.filename ?? '', step: 1 },
    { label: 'Why this hackathon', value: form.whyInterested, step: 2 },
    { label: themedQuestion, value: form.themedAnswer, step: 3 },
  ];

  return (
    <div className="space-y-4">
      <p className="gqh-help">
        Give it one last look. Anything can still be changed &mdash; nothing is sent until you
        press submit.
      </p>
      <dl className="divide-y divide-[#173154] border border-[#173154]">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-2 p-4 sm:grid-cols-[190px_1fr] sm:gap-4">
            <dt
              className="text-[#9cc9ff]"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.6px',
                lineHeight: 1.5,
              }}
            >
              {row.label}
            </dt>
            <dd className="flex items-start justify-between gap-4">
              <span
                className="whitespace-pre-wrap break-words text-[rgba(255,255,255,0.82)]"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  lineHeight: 1.65,
                }}
              >
                {row.value || '—'}
              </span>
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="gqh-link-btn shrink-0"
              >
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SuccessScreen({ email, confirmed }: { email: string; confirmed: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050508] px-6 py-28">
      <FormStyles />
      <div className="gqh-panel relative w-full max-w-[600px] border-2 border-[#294f7d] bg-[#0B0D14]/95 p-9 text-center">
        <PanelCorners />
        <div
          className="mb-4 text-[#4cff87]"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '2px',
          }}
        >
          TRANSMISSION COMPLETE
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mb-5 uppercase text-white outline-none"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(18px, 2.6vw, 26px)',
            lineHeight: 1.45,
            textShadow: '0 0 24px rgba(4,74,148,0.35)',
          }}
        >
          You Are In The Queue
        </h1>
        <p
          className="mb-6 text-[rgba(255,255,255,0.7)]"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', lineHeight: 1.75 }}
        >
          {confirmed
            ? 'Your application was received.'
            : 'Your application was sent.'}{' '}
          We review on a rolling basis and will email{' '}
          <span className="text-[#9cc9ff]">{email}</span> with your decision, plus prep resources
          before October 2.
        </p>
        <a href="/" className="gqh-btn-primary inline-block no-underline">
          BACK TO HOME
        </a>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- fields --- */

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="gqh-label">
        {label} <span className="text-[#FA4616]">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        data-invalid={error ? 'true' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`gqh-input ${error ? 'gqh-input--error' : ''}`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="gqh-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Native radios styled as arcade pills. Using real inputs means arrow-key
 * navigation, a single tab stop, and screen reader semantics come for free.
 */
function RadioGroup({
  label,
  help,
  name,
  options,
  value,
  onChange,
  error,
  columns = 'auto',
}: {
  label: string;
  help?: string;
  name: string;
  options: { value: string; hint?: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: 'auto' | 'one';
}) {
  return (
    <fieldset className="space-y-2 border-0 p-0">
      <legend className="gqh-label mb-1">
        {label} <span className="text-[#FA4616]">*</span>
      </legend>
      {help && <p className="gqh-help">{help}</p>}
      <div
        className={
          columns === 'one'
            ? 'grid grid-cols-1 gap-3'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3'
        }
      >
        {options.map((option, index) => (
          <label key={option.value} className="gqh-pill">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="gqh-radio-input"
              data-invalid={error && index === 0 ? 'true' : undefined}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            <span className="gqh-pill__body">
              <span className="gqh-pill__value">{option.value}</span>
              {option.hint && <span className="gqh-pill__hint">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="gqh-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function StepIndicator({
  stepIndex,
  onJump,
}: {
  stepIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Application progress">
      {STEPS.map((entry, index) => {
        const state = index === stepIndex ? 'current' : index < stepIndex ? 'done' : 'todo';
        return (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => index < stepIndex && onJump(index)}
              disabled={index > stepIndex}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`gqh-step gqh-step--${state}`}
            >
              <span className="gqh-step__num">{index + 1}</span>
              <span className="gqh-step__label">{entry.level}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function PanelCorners() {
  return (
    <>
      <span className="pointer-events-none absolute -left-1 -top-1 h-8 w-8 border-l-4 border-t-4 border-[#044a94]" />
      <span className="pointer-events-none absolute -right-1 -top-1 h-8 w-8 border-r-4 border-t-4 border-[#044a94]" />
      <span className="pointer-events-none absolute -bottom-1 -left-1 h-8 w-8 border-b-4 border-l-4 border-[#044a94]" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 h-8 w-8 border-b-4 border-r-4 border-[#044a94]" />
    </>
  );
}

function FormStyles() {
  return (
    <style>{`
      .gqh-panel {
        box-shadow:
          0 0 28px rgba(4, 74, 148, 0.14),
          inset 0 0 0 1px rgba(255, 255, 255, 0.02),
          0 18px 40px rgba(0, 0, 0, 0.45);
      }

      .gqh-label {
        display: block;
        font-family: 'Space Mono', monospace;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.4px;
        line-height: 1.5;
        color: #eef4ff;
      }

      .gqh-help {
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.5);
      }

      .gqh-error {
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.5;
        color: #ff8a5c;
      }

      .gqh-kbd {
        border: 1px solid #294f7d;
        background: #0b1524;
        padding: 1px 6px;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        color: #9cc9ff;
      }

      .gqh-input {
        width: 100%;
        background: #05070d;
        border: 1px solid #253047;
        color: #f4f4f4;
        padding: 12px 14px;
        font-family: 'Space Mono', monospace;
        font-size: 15px;
        line-height: 1.5;
        outline: none;
        transition: border-color 150ms ease, box-shadow 150ms ease;
      }

      .gqh-input::placeholder {
        color: rgba(255, 255, 255, 0.26);
      }

      .gqh-input:hover {
        border-color: #35507a;
      }

      .gqh-input:focus-visible {
        border-color: #9cc9ff;
        box-shadow: 0 0 0 2px rgba(156, 201, 255, 0.35), 0 0 18px rgba(4, 74, 148, 0.3);
      }

      .gqh-input--error {
        border-color: #7a2f18;
      }

      .gqh-textarea {
        resize: vertical;
        min-height: 170px;
      }

      /* Real file input, visually hidden but still focusable and clickable. */
      .gqh-file-input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }

      .gqh-dropzone {
        position: relative;
        display: block;
        border: 2px dashed #294f7d;
        background: #05070d;
        padding: 30px 20px;
        text-align: center;
        cursor: pointer;
        transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
      }

      .gqh-dropzone:hover {
        border-color: #9cc9ff;
        background: #070b14;
      }

      .gqh-dropzone--error {
        border-color: #7a2f18;
      }

      .gqh-dropzone:focus-within {
        border-color: #9cc9ff;
        border-style: solid;
        box-shadow: 0 0 0 2px rgba(156, 201, 255, 0.35), 0 0 20px rgba(4, 74, 148, 0.28);
      }

      .gqh-dropzone__body {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .gqh-dropzone__title {
        font-family: 'Space Mono', monospace;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #eef4ff;
        word-break: break-all;
      }

      .gqh-dropzone__hint {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
      }

      .gqh-pill {
        position: relative;
        display: block;
        border: 1px solid #253047;
        background: #05070d;
        padding: 13px 15px;
        cursor: pointer;
        transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
      }

      .gqh-pill:hover {
        border-color: #35507a;
      }

      .gqh-radio-input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        margin: 0;
      }

      .gqh-pill:has(.gqh-radio-input:checked) {
        border-color: #FA4616;
        background: rgba(250, 70, 22, 0.1);
        box-shadow: inset 0 0 22px rgba(250, 70, 22, 0.08);
      }

      .gqh-pill:has(.gqh-radio-input:focus-visible) {
        box-shadow: 0 0 0 2px rgba(156, 201, 255, 0.45), 0 0 18px rgba(4, 74, 148, 0.3);
        border-color: #9cc9ff;
      }

      .gqh-pill__body {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .gqh-pill__value {
        font-family: 'Space Mono', monospace;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.6px;
        color: rgba(255, 255, 255, 0.72);
      }

      .gqh-pill:has(.gqh-radio-input:checked) .gqh-pill__value {
        color: #ff7d4f;
      }

      .gqh-pill__hint {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.42);
      }

      .gqh-btn-primary {
        background: linear-gradient(180deg, #151d2a 0%, #101722 45%, #0a1119 100%);
        border: 2px solid #294f7d;
        color: #eef4ff;
        font-family: 'Space Mono', monospace;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 1.6px;
        padding: 14px 26px;
        cursor: pointer;
        clip-path: polygon(4% 0, 96% 0, 100% 22%, 100% 78%, 96% 100%, 4% 100%, 0 78%, 0 22%);
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
        box-shadow: 0 0 20px rgba(4, 74, 148, 0.16);
      }

      .gqh-btn-primary:hover:not(:disabled) {
        border-color: #9cc9ff;
        transform: translateY(-1px);
        box-shadow: 0 0 26px rgba(4, 74, 148, 0.34);
      }

      .gqh-btn-primary:focus-visible {
        outline: 2px solid #9cc9ff;
        outline-offset: 3px;
      }

      .gqh-btn-primary:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .gqh-btn-ghost {
        background: transparent;
        border: 1px solid #294f7d;
        color: rgba(255, 255, 255, 0.66);
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.4px;
        padding: 13px 22px;
        cursor: pointer;
        transition: color 150ms ease, border-color 150ms ease;
      }

      .gqh-btn-ghost:hover:not(:disabled) {
        color: #9cc9ff;
        border-color: #9cc9ff;
      }

      .gqh-btn-ghost:focus-visible {
        outline: 2px solid #9cc9ff;
        outline-offset: 3px;
      }

      .gqh-btn-ghost:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .gqh-link-btn {
        background: none;
        border: none;
        padding: 2px 0;
        color: #9cc9ff;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        letter-spacing: 0.5px;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
      }

      .gqh-link-btn:hover {
        color: #FA4616;
      }

      .gqh-link-btn:focus-visible {
        outline: 2px solid #9cc9ff;
        outline-offset: 2px;
      }

      .gqh-step {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #253047;
        background: #0B0D14;
        padding: 8px 12px;
        font-family: 'Space Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.1px;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
      }

      .gqh-step:disabled {
        cursor: default;
      }

      .gqh-step__num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border: 1px solid currentColor;
        font-size: 10px;
      }

      .gqh-step--current {
        border-color: #FA4616;
        color: #ff7d4f;
        background: rgba(250, 70, 22, 0.09);
      }

      .gqh-step--done {
        border-color: #294f7d;
        color: #9cc9ff;
      }

      .gqh-step--done:hover {
        border-color: #9cc9ff;
        background: rgba(4, 74, 148, 0.14);
      }

      .gqh-step:focus-visible {
        outline: 2px solid #9cc9ff;
        outline-offset: 2px;
      }

      @media (max-width: 640px) {
        .gqh-step__label {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .gqh-btn-primary,
        .gqh-btn-ghost,
        .gqh-input,
        .gqh-pill,
        .gqh-dropzone,
        .gqh-step {
          transition: none;
        }
      }
    `}</style>
  );
}
