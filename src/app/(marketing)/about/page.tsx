import Link from "next/link";

export const metadata = {
  title: "Our story — CoHome",
};

export default function AboutPage() {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16">
      <h1 className="text-4xl">Why CoHome exists</h1>

      <p>
        CoHome started with a simple observation: a lot of adults are living
        alone who never planned to, and never wanted to.
      </p>

      <p>
        Divorce, loss, or simply how life unfolded — by your forties and
        fifties, the paths that lead to an empty house are many, and none of
        them are anyone's fault. What they have in common is what comes after:
        rent or a mortgage carried alone, dinners for one, and a quiet that
        gets heavier the longer it lasts.
      </p>

      <p>
        The strange part is that the solution has been around forever.
        People sharing a home — not as a couple, not as family, just as two
        adults who get along and split the costs — used to be ordinary. Then
        somewhere along the way, housemates became something you stopped doing
        after thirty, and living alone became the default, whatever it cost.
      </p>

      <p>
        We think that default deserves a challenge. Not because independence
        isn't valuable — it is — but because independence and isolation aren't
        the same thing. The right housemate doesn't take away your freedom.
        They take away the second rent cheque, the silent kitchen, and the
        feeling that nobody would notice if you didn't come home.
      </p>

      <h2 className="mt-4 text-2xl">What we care about</h2>

      <p>
        <strong>Honesty over optimism.</strong> Shared homes fail on small
        things: dishes, noise, guests, schedules. So that's what we ask about,
        plainly, before you ever meet someone. The goal isn't to present your
        best self — it's to find someone whose ordinary self fits yours.
      </p>

      <p>
        <strong>Friendship, full stop.</strong> CoHome is not a dating
        service, and we work hard to keep it that way — in our words, our
        rules, and our design. Anyone treating it otherwise is asked to leave.
      </p>

      <p>
        <strong>Taking your time.</strong> There's no countdown here and no
        pressure to decide. Messages stay on CoHome until you decide
        otherwise. Meet for coffee before you talk about leases. The good
        arrangements are the unhurried ones.
      </p>

      <p>
        We're starting in Greater Vancouver, one of the hardest places in the
        country to afford a home alone — and one of the easiest places to
        understand why sharing one makes sense.
      </p>

      <p className="text-stone">
        If any of this sounds like the way you'd want to live, we'd be glad to
        have you.
      </p>

      <div>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-terracotta px-6 py-2.5 font-medium text-white transition-colors hover:bg-terracotta-dark"
        >
          Join CoHome
        </Link>
      </div>
    </article>
  );
}
