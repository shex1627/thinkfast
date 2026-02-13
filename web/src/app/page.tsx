export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-accent-light">Explain</span>Fast
      </h1>
      <p className="text-xl text-muted max-w-lg mb-8">
        Practice explaining concepts clearly, under time pressure. Get AI-powered
        feedback to sharpen your communication skills.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="/practice"
          className="px-8 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-lg transition-colors text-lg"
        >
          Start Practicing
        </a>
        <a
          href="/history"
          className="px-8 py-3 border border-card-border hover:border-accent text-foreground font-medium rounded-lg transition-colors text-lg"
        >
          View History
        </a>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl">
        <div className="p-4 rounded-lg bg-card border border-card-border">
          <h3 className="font-semibold mb-2">Pick a Topic</h3>
          <p className="text-sm text-muted">
            Choose from preset topics or add your own areas of expertise.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-card-border">
          <h3 className="font-semibold mb-2">Explain Under Pressure</h3>
          <p className="text-sm text-muted">
            Get a random prompt and explain it before the timer runs out.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-card-border">
          <h3 className="font-semibold mb-2">Get Scored by AI</h3>
          <p className="text-sm text-muted">
            Claude evaluates your clarity, accuracy, structure, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
