export const metadata = {
  title: "Safety & community guidelines — CoHome",
};

export default function GuidelinesPage() {
  return (
    <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16">
      <h1 className="text-4xl">Safety &amp; community guidelines</h1>
      <p className="text-stone">
        CoHome works because everyone here wants the same thing: a good,
        platonic living arrangement. These guidelines keep it that way.
      </p>

      <h2 className="mt-2 text-2xl">This is not a dating service</h2>
      <p>
        We say it on the landing page, we say it during sign-up, and we'll say
        it here: CoHome is for finding a housemate and a friend — never a
        romantic partner. Flirting, romantic advances, and using CoHome to
        meet people for dating are all against the rules, full stop.
      </p>
      <p>
        If someone approaches you romantically, you can report it in two taps
        — "Approached me romantically" is the first option on the report
        form. We treat these reports seriously; accounts that use CoHome for
        dating are removed.
      </p>

      <h2 className="mt-2 text-2xl">Your privacy, by design</h2>
      <ul className="flex list-disc flex-col gap-2 pl-5">
        <li>
          Your email and phone number are never shown to other members —
          there's nowhere on CoHome they even appear.
        </li>
        <li>
          Messaging opens only after both people express interest. Nobody can
          contact you unless you've chosen to connect.
        </li>
        <li>
          One-sided interest is invisible: if you express interest and it
          isn't returned, the other person simply never knows.
        </li>
        <li>
          We recommend keeping conversations on CoHome until you've met and
          feel comfortable — please don't feel obliged to share your number
          just because someone asks.
        </li>
      </ul>

      <h2 className="mt-2 text-2xl">Verification</h2>
      <p>
        Every account confirms an email address before a profile can appear
        in browsing. Phone and ID verification badges are coming — they'll
        always be optional, and shown on profiles so you can factor them into
        your own comfort level.
      </p>

      <h2 className="mt-2 text-2xl">Report and block, anywhere</h2>
      <p>
        The &bull;&bull;&bull; menu on every profile and in every conversation
        lets you report or block. Blocking hides you from each other
        completely and closes any conversation — the other person is not
        notified. Reports come straight to us and are never shown to the
        person you reported.
      </p>
      <p>Report anything that feels off, including:</p>
      <ul className="flex list-disc flex-col gap-2 pl-5">
        <li>Romantic or sexual advances of any kind</li>
        <li>Harassment, pressure, or unkindness</li>
        <li>Profiles that don't seem to be a real person</li>
        <li>Requests for money, or anything that resembles a scam</li>
        <li>Anything that makes you feel unsafe — you don't need to be sure</li>
      </ul>

      <h2 className="mt-2 text-2xl">Meeting safely</h2>
      <ul className="flex list-disc flex-col gap-2 pl-5">
        <li>Meet first in a public place — a coffee shop works well.</li>
        <li>Tell a friend or family member where you're going.</li>
        <li>
          Take as many meetings as you need before discussing moving in.
          Anyone worth living with will respect your pace.
        </li>
        <li>
          Involve the practical paperwork (leases, references) before keys
          change hands. CoHome introduces people; the arrangement itself is
          yours to shape.
        </li>
      </ul>

      <h2 className="mt-2 text-2xl">Be the housemate you're looking for</h2>
      <p>
        Answer the lifestyle questions honestly, even the unflattering ones —
        that's what makes the compatibility scores mean something. Reply when
        you can, decline kindly when it isn't a fit, and treat every
        conversation the way you'd want your own approached.
      </p>
    </article>
  );
}
