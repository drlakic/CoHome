import Link from "next/link";

const HOW_IT_WORKS = [
  {
    title: "Tell us how you actually live",
    body: "Morning person or night owl. Tidy or lived-in. Guests often or rarely. The everyday details that decide whether a shared home feels easy.",
  },
  {
    title: "See who fits",
    body: "We compare the practical things first — house rules, routines, family rhythms — and show you how compatible your day-to-day lives are, as a simple percentage.",
  },
  {
    title: "Get to know each other slowly",
    body: "Express interest privately. Only when it's mutual can you message each other, here on CoHome — no phone numbers, no pressure, no rush.",
  },
];

const SCENARIOS = [
  {
    who: "After a divorce",
    body: "The house is too big and too quiet now. Someone who keeps similar hours, respects a tidy kitchen, and doesn't mind the kids visiting every other weekend would change everything.",
  },
  {
    who: "After a loss",
    body: "It isn't about the rent, mostly. It's about someone else's kettle going on in the morning, and a hello at the end of the day.",
  },
  {
    who: "Single, by choice",
    body: "Living alone was great at 35. At 55, splitting costs with a compatible housemate means more travel, more savings, and company for dinner when you both feel like it.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
        <h1 className="text-4xl leading-tight sm:text-5xl">
          A place to share your home — and not live alone
        </h1>
        <p className="max-w-xl text-lg text-stone">
          CoHome helps adults 30 and up find a compatible, platonic housemate
          in Greater Vancouver. Share the costs, keep the company, and live the
          way you actually like to live.
        </p>
        <Link
          href="/signup"
          className="rounded-full bg-terracotta px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-terracotta-dark"
        >
          Find your housemate
        </Link>
        <p className="max-w-md rounded-xl bg-sage-light px-5 py-3 text-sm text-sage-dark">
          CoHome is not a dating service. Everything here — the questions we
          ask, the people we introduce you to, the way you meet — is built for
          friendship and shared living, nothing else.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-linen py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-10 text-center text-3xl">How it works</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage font-heading text-lg text-white">
                  {i + 1}
                </span>
                <h3 className="text-xl">{step.title}</h3>
                <p className="text-stone">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why people come here */}
      <section className="py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 className="mb-3 text-center text-3xl">
            Why people come to CoHome
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-stone">
            The situations below are the ones we built this for. If one of
            them sounds like yours, you're in the right place.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SCENARIOS.map((s) => (
              <div
                key={s.who}
                className="flex flex-col gap-3 rounded-2xl bg-linen p-6 ring-1 ring-mist/60"
              >
                <h3 className="text-lg text-sage-dark">{s.who}</h3>
                <p className="text-stone">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-sage py-16 text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 text-center">
          <h2 className="text-3xl">Built carefully, on purpose</h2>
          <ul className="flex flex-col gap-2 text-white/90">
            <li>Your contact details stay private until you both choose to connect.</li>
            <li>Every profile is email-verified before it can appear.</li>
            <li>Report and block are one tap away, everywhere on CoHome.</li>
          </ul>
          <Link
            href="/guidelines"
            className="rounded-full bg-white px-6 py-2.5 font-medium text-sage-dark transition-colors hover:bg-cream"
          >
            Read our community guidelines
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center">
        <h2 className="text-3xl">The right housemate is out there</h2>
        <p className="max-w-xl text-stone">
          It takes about ten minutes to describe how you like to live. We'll
          take it from there.
        </p>
        <Link
          href="/signup"
          className="rounded-full bg-terracotta px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-terracotta-dark"
        >
          Get started
        </Link>
      </section>
    </div>
  );
}
