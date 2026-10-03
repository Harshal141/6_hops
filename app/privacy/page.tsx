import type { Metadata } from "next";
import { GridBackground, Navbar, Footer } from "../components";

export const metadata: Metadata = {
  title: "Privacy · 6 hops",
  description: "What 6 hops collects, how resume imports work, and how to delete your data.",
};

const CONTACT_EMAIL = "harshalmukundapatil@gmail.com";
// The "Changes" section promises this moves whenever the text does.
const LAST_UPDATED = "2 October 2026";

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "What we collect",
    body: "Your LinkedIn sign-in details (name, email, photo), what you add to your profile, your connections, and if you import a resume, the text we pull out of it.",
  },
  {
    heading: "Resume imports",
    body: "We read the PDF on our server and keep only its text, not the file. Emails and phone numbers are removed before anything else happens. The text is sent to an AI model (Google Gemini, or Groq as a backup) to pull out your details. On the free tier we use, Google may use what's sent to improve its products. You check everything before it's saved.",
  },
  {
    heading: "Who sees your profile",
    body: "Your profile is visible to anyone with its link.",
  },
  {
    heading: "Where it's stored",
    body: "Our database (Neon) and hosting (Vercel).",
  },
  {
    heading: "Deleting your data",
    body: (
      <>
        Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-fg underline underline-offset-2">
          {CONTACT_EMAIL}
        </a>{" "}
        and we&apos;ll delete your account and data. We&apos;ll try to do it quickly but can&apos;t
        promise a set timeframe.
      </>
    ),
  },
  {
    heading: "Changes",
    body: "If this page changes, the date at the top changes.",
  },
];

/** Public (outside the middleware matcher), static, server-rendered. */
export default function PrivacyPage() {
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6">
        <article className="mx-auto max-w-2xl bg-surface/90 backdrop-blur-sm border border-border p-4 sm:p-8 font-mono">
          <h1 className="text-xl sm:text-2xl font-bold text-fg">Privacy</h1>
          <p className="text-xs text-fg-subtle mt-1 mb-6">Last updated {LAST_UPDATED}</p>
          <div className="space-y-6">
            {SECTIONS.map(({ heading, body }) => (
              <section key={heading}>
                <h2 className="text-sm font-semibold text-fg mb-2">{heading}</h2>
                <p className="text-sm text-fg-body leading-relaxed [overflow-wrap:anywhere]">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </GridBackground>
  );
}
