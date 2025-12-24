export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-zinc-400 text-sm mb-8">Last updated: December 2024</p>

      <div className="space-y-6 text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What is Cursor Score?</h2>
          <p>
            Cursor Score is a community leaderboard where users can share and compare their Cursor IDE usage statistics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Information We Collect</h2>
          <p>When you sign in with GitHub or X, we collect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Your username/handle (for display on the leaderboard)</li>
            <li>Your profile link (so others can find you)</li>
          </ul>
          <p className="mt-3">
            <strong className="text-white">We do not store your email address.</strong> While the authentication provider may share your email during sign-in, we do not save or use it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Screenshots</h2>
          <p>
            When you submit your Cursor stats, you upload a screenshot. This screenshot is stored and displayed publicly on the leaderboard.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">How We Use Your Information</h2>
          <p>Your information is used solely to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Display your username on the public leaderboard</li>
            <li>Link to your social profile</li>
            <li>Show your submitted Cursor statistics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties. Your leaderboard entry is publicly visible by design.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p>
            Questions? Reach out on X or GitHub.
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

