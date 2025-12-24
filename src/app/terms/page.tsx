export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <p className="text-zinc-400 text-sm mb-8">Last updated: December 2024</p>

      <div className="space-y-6 text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What is Cursor Score?</h2>
          <p>
            Cursor Score is a community leaderboard for sharing Cursor IDE usage statistics. By using this service, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Your Account</h2>
          <p>
            You sign in using your GitHub or X account. You are responsible for your account and any content you submit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Submissions</h2>
          <p>By submitting your Cursor stats:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>You confirm the screenshot is yours and accurate</li>
            <li>You agree to have your stats displayed publicly</li>
            <li>You grant us permission to display your username and screenshot</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Prohibited Use</h2>
          <p>Do not:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Submit fake or manipulated screenshots</li>
            <li>Impersonate others</li>
            <li>Abuse or spam the service</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove any submission or ban users who violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">No Warranty</h2>
          <p>
            This service is provided "as is" without warranties. We may modify or discontinue the service at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h2>
          <p>
            We are not liable for any damages arising from your use of this service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Changes</h2>
          <p>
            We may update these terms. Continued use of the service constitutes acceptance of any changes.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-zinc-800">
        <a href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Back to Cursor Score
        </a>
      </div>
    </div>
  );
}

