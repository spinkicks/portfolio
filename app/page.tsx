import SynthMoon from "./components/SynthMoon";
import TypingTest from "./components/TypingTest";

export default function Home() {
  return (
    <main className="relative min-h-[300vh] bg-black overflow-x-hidden">
      {/* background is the synth-bg image*/}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/moonless-bg.png')" }}
      >
        {/*dark overlay so text pops */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. moving moon layer */}
      <SynthMoon />

      {/* 3. scrollable content layer (todo, fix space in between) */}
      <div className="relative z-20 w-full max-w-6xl mx-auto pt-80 px-6 pb-24 space-y-8">
        {/* Section 1: top */}
        <section className="w-fit mx-auto p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(122,166,199,0.12)] card-hover">
          <h1 className="text-7xl font-extrabold font-mono text-cyan-100 tracking-tighter text-center glow-cyan">
            David O.
          </h1>
          <p className="mt-4 text-cyan-200 font-mono text-2xl text-center">
            Austin, TX
          </p>
        </section>

        <section className="w-full max-w-4xl mx-auto p-6 glass-card rounded-2xl shadow-[0_0_25px_rgba(122,166,199,0.12)] card-hover">
          <p className="text-cyan-200 font-mono text-base leading-relaxed">
            I&apos;m a CS student at the University of Texas at Austin, minoring in Statistics & Data Science. My technical background spans AI/ML engineering and full-stack development. I&apos;m passionate about scalable solutions.
          </p>
        </section>

        {/* Section 2 & 3: Projects and Contact side by side */}
        <div className="flex gap-8 justify-center flex-wrap">
          <section className="w-fit p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(122,166,199,0.12)] card-hover">
            <h2 className="text-3xl font-bold text-cyan-100 mb-4 font-mono glow-cyan text-center">
              Projects
            </h2>
            <div className="space-y-4 text-cyan-200 font-mono">
              <p>
                1.{" "}
                <a
                  href="https://illuminate.projectempower.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-100 hover:underline"
                >
                  Illuminate
                </a>{" "}
                [Next.js]
              </p>
              <p>
                2.{" "}
                <a
                  href="https://devpost.com/software/tender-d70yp5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-100 hover:underline"
                >
                  Tendir
                </a>{" "}
                (Typescript)
              </p>
              <p>3. PintOS Kernel [C]</p>
            </div>
          </section>

          <section className="w-fit p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(122,166,199,0.12)] card-hover">
            <h2 className="text-3xl font-bold text-cyan-100 mb-4 font-mono glow-cyan text-center">
              Contact
            </h2>
            <div className="space-y-2 font-mono text-cyan-200">
              <a
                href="https://github.com/spinkicks"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-cyan-300 hover:text-cyan-100 hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/calmguy/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-cyan-300 hover:text-cyan-100 hover:underline"
              >
                LinkedIn
              </a>
              <a
                href="https://monkeytype.com/profile/Dipslox"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-cyan-300 hover:text-cyan-100 hover:underline"
              >
                MonkeyType
              </a>
              <a
                href="https://open.spotify.com/user/cxxo2nymwpjcgw7kz5cttbrhj?si=8a890bb5b6584942"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-cyan-300 hover:text-cyan-100 hover:underline"
              >
                Spotify
              </a>
            </div>
          </section>
        </div>

        {/* Experience section */}
        <section className="p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(122,166,199,0.12)] card-hover space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-4xl font-bold font-mono text-cyan-100 glow-cyan">
              Experience
            </h2>
            <p className="text-sm text-cyan-200 font-mono">
              Highlights of my recent work.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="reveal-card">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-xl flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">Mercor Intelligence</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">AI/ML Intern · Feb 2025 – Apr 2025</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-xl h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Engineered Python scripts to analyze model failures and optimize training data for a leading LLM; formatted datasets in LaTeX.</li>
                  <li>Applied discrete math/stats/calculus to improve evaluation workflows.</li>
                  <li>Drove ~0.5% accuracy gain via targeted analysis of frequent errors.</li>
                </ul>
              </div>
            </div>

            <div className="reveal-card">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-xl flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">University of Houston</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">ML Researcher & SWE Intern · May 2023 – Aug 2023</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-xl h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Built/analyzed traffic simulations (Python, SUMO, Flow) to study flow phenomena and paradoxes.</li>
                  <li>Used TraCI API to control simulations and collect data validating real-world models.</li>
                </ul>
              </div>
            </div>

            <div className="reveal-card sm:col-span-2">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-xl flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">Project: Empower</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">Chief Operations Officer · Aug 2022 – Jan 2024</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-xl h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Scaled a 501c3 to 100+ members across 10+ chapters; led chapter teams.</li>
                  <li>Orchestrated a $100k DevPost hackathon.</li>
                  <li>Collaborated on Next.js frontend and Node/Supabase/SQL backend.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Typing test section */}
        <TypingTest />

      </div>
    </main>
  );
}
