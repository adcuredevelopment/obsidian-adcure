import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Building2,
  Hash,
  FileBadge,
  Landmark,
  User,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign Up — Adcure Agency" },
      {
        name: "description",
        content:
          "Start your AdCure journey. Register your business to unlock premium ad account management.",
      },
      { property: "og:title", content: "Start Your AdCure Journey" },
      {
        property: "og:description",
        content: "Register your business with AdCure Agency.",
      },
    ],
  }),
  component: SignUpPage,
});

type FormState = {
  companyName: string;
  kvk: string;
  btw: string;
  iban: string;
  fullName: string;
  email: string;
  phone: string;
  agree: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "msn.com",
];

// IBAN mod-97 check
function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");
  // mod 97 on long string
  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder === 1;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.companyName.trim()) {
    errors.companyName = "Bedrijfsnaam is verplicht";
  } else if (values.companyName.trim().length < 2) {
    errors.companyName = "Minimaal 2 tekens";
  }

  if (!values.kvk.trim()) {
    errors.kvk = "KVK nummer is verplicht";
  } else if (!/^\d{8}$/.test(values.kvk.trim())) {
    errors.kvk = "KVK moet exact 8 cijfers bevatten";
  }

  if (!values.btw.trim()) {
    errors.btw = "BTW nummer is verplicht";
  } else if (!/^NL\d{9}B\d{2}$/.test(values.btw.trim().toUpperCase())) {
    errors.btw = "Formaat: NL123456789B01";
  }

  if (values.iban.trim()) {
    if (!isValidIban(values.iban)) {
      errors.iban = "Ongeldig IBAN nummer";
    }
  }

  if (!values.fullName.trim()) {
    errors.fullName = "Volledige naam is verplicht";
  } else if (!/\s/.test(values.fullName.trim())) {
    errors.fullName = "Voer voor- en achternaam in";
  }

  if (!values.email.trim()) {
    errors.email = "Email is verplicht";
  } else {
    const email = values.email.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      errors.email = "Ongeldig email adres";
    } else {
      const domain = email.split("@")[1];
      if (FREE_EMAIL_DOMAINS.includes(domain)) {
        errors.email = "Gebruik een zakelijk email adres (geen Gmail/Hotmail)";
      }
    }
  }

  if (!values.phone.trim()) {
    errors.phone = "Telefoonnummer is verplicht";
  } else if (!/^\+\d{8,15}$/.test(values.phone.replace(/\s+/g, ""))) {
    errors.phone = "Formaat: +31612345678";
  }

  if (!values.agree) {
    errors.agree = "Je moet akkoord gaan met de voorwaarden";
  }

  return errors;
}

function SignUpPage() {
  const [values, setValues] = useState<FormState>({
    companyName: "",
    kvk: "",
    btw: "",
    iban: "",
    fullName: "",
    email: "",
    phone: "",
    agree: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (touched[key] || Object.keys(errors).length) {
        setErrors(validate(next));
      }
      return next;
    });
  };

  const handleBlur = (key: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    setTouched({
      companyName: true,
      kvk: true,
      btw: true,
      iban: true,
      fullName: true,
      email: true,
      phone: true,
      agree: true,
    });
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    // Mock async submission
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] gradient-glow opacity-80" />
        <div className="relative w-full max-w-md animate-fade-in">
          <GlassCard glow className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 ring-1 ring-success/30">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Aanvraag ontvangen
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bedankt {values.fullName.split(" ")[0] || ""}! We hebben je aanvraag
              ontvangen en nemen binnen 24 uur contact op via{" "}
              <span className="text-foreground">{values.email}</span>.
            </p>
            <Button asChild className="mt-6 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow hover:opacity-95">
              <Link to="/">
                Terug naar home <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] gradient-glow opacity-80" />
      <div className="relative mx-auto w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-7 flex flex-col items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
              <path d="M12 3 L21 20 L3 20 Z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold tracking-tight text-foreground">
              Adcure
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Agency
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
            Start Your AdCure Journey
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registreer je bedrijf om toegang te krijgen tot premium ad accounts en
            wallets.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <GlassCard className="space-y-7">
            {/* Section 1 */}
            <section className="space-y-4">
              <SectionHeader
                index={1}
                title="Bedrijfsgegevens"
                subtitle="Officiële gegevens voor facturatie"
              />

              <Field
                id="companyName"
                label="Bedrijfsnaam"
                icon={Building2}
                hint="Bijv. AdCure Holding B.V."
                value={values.companyName}
                onChange={(v) => setField("companyName", v)}
                onBlur={() => handleBlur("companyName")}
                error={errors.companyName}
                required
                autoComplete="organization"
              />

              <Field
                id="kvk"
                label="KVK Nummer"
                icon={Hash}
                hint="8 cijfers, bijv. 12345678"
                placeholder="12345678"
                value={values.kvk}
                onChange={(v) => setField("kvk", v.replace(/\D/g, "").slice(0, 8))}
                onBlur={() => handleBlur("kvk")}
                error={errors.kvk}
                required
                inputMode="numeric"
              />

              <Field
                id="btw"
                label="BTW Nummer"
                icon={FileBadge}
                hint="Formaat: NL123456789B01"
                placeholder="NL123456789B01"
                value={values.btw}
                onChange={(v) => setField("btw", v.toUpperCase().slice(0, 14))}
                onBlur={() => handleBlur("btw")}
                error={errors.btw}
                required
              />

              <Field
                id="iban"
                label="IBAN"
                optional
                icon={Landmark}
                hint="Optioneel — bijv. NL91ABNA0417164300"
                placeholder="NL91ABNA0417164300"
                value={values.iban}
                onChange={(v) =>
                  setField("iban", v.toUpperCase().replace(/\s+/g, "").slice(0, 34))
                }
                onBlur={() => handleBlur("iban")}
                error={errors.iban}
              />
            </section>

            <div className="h-px bg-border" />

            {/* Section 2 */}
            <section className="space-y-4">
              <SectionHeader
                index={2}
                title="Contactgegevens"
                subtitle="Hoe kunnen we je bereiken?"
              />

              <Field
                id="fullName"
                label="Volledige Naam"
                icon={User}
                hint="Voor- en achternaam"
                placeholder="Jan de Vries"
                value={values.fullName}
                onChange={(v) => setField("fullName", v)}
                onBlur={() => handleBlur("fullName")}
                error={errors.fullName}
                required
                autoComplete="name"
              />

              <Field
                id="email"
                label="Zakelijk Email"
                type="email"
                icon={Mail}
                hint="Geen Gmail/Hotmail — gebruik je bedrijfsdomein"
                placeholder="jan@bedrijf.nl"
                value={values.email}
                onChange={(v) => setField("email", v)}
                onBlur={() => handleBlur("email")}
                error={errors.email}
                required
                autoComplete="email"
              />

              <Field
                id="phone"
                label="Telefoonnummer"
                type="tel"
                icon={Phone}
                hint="Internationaal formaat: +31612345678"
                placeholder="+31612345678"
                value={values.phone}
                onChange={(v) => setField("phone", v.replace(/[^\d+]/g, ""))}
                onBlur={() => handleBlur("phone")}
                error={errors.phone}
                required
                autoComplete="tel"
              />
            </section>

            <div className="h-px bg-border" />

            {/* Terms + submit */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={values.agree}
                  onCheckedChange={(c) => setField("agree", c === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="agree"
                  className="text-sm leading-snug text-muted-foreground"
                >
                  Ik ga akkoord met de{" "}
                  <a
                    href="/terms"
                    className="font-medium text-foreground underline-offset-4 hover:text-primary-glow hover:underline"
                  >
                    voorwaarden
                  </a>{" "}
                  en het privacybeleid.
                </label>
              </div>
              {errors.agree && touched.agree ? (
                <p className="-mt-2 text-xs font-medium text-destructive">
                  {errors.agree}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aanvraag verzenden…
                  </>
                ) : (
                  <>
                    Aanvraag Indienen
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Heb je al een account?{" "}
                <a
                  href="/login"
                  className="font-medium text-foreground underline-offset-4 hover:text-primary-glow hover:underline"
                >
                  Inloggen
                </a>
              </p>
            </div>
          </GlassCard>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Beschermd door enterprise-grade encryptie. Je gegevens worden nooit
          gedeeld.
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  subtitle,
}: {
  index: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-surface-elevated text-xs font-semibold text-foreground">
        {index}
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

function Field({
  id,
  label,
  icon: Icon,
  hint,
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required,
  optional,
  autoComplete,
  inputMode,
}: FieldProps) {
  const hasError = Boolean(error);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
        {optional ? (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
            Optioneel
          </span>
        ) : null}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={hasError}
          className={cn(
            "h-11 rounded-lg border-border bg-background/40 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40",
            hasError &&
              "border-destructive/60 focus-visible:ring-destructive/40",
          )}
        />
      </div>
      {hasError ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}
