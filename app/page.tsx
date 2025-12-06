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
        <section className="w-fit mx-auto p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(0,243,255,0.12)] card-hover">
          <h1 className="text-7xl font-extrabold font-mono text-cyan-100 tracking-tighter text-center glow-cyan">
            David O.
          </h1>
          <p className="mt-4 text-cyan-200 font-mono text-2xl text-center">
            Austin, TX
          </p>
        </section>

        {/* Section 2 & 3: Projects and Contact side by side */}
        <div className="flex gap-8 justify-center flex-wrap">
          <section className="w-fit p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(0,243,255,0.12)] card-hover">
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

          <section className="w-fit p-8 glass-card rounded-2xl shadow-[0_0_25px_rgba(0,243,255,0.12)] card-hover">
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

        {/* Typing test section */}
        <TypingTest />

      </div>
    </main>
  );
}
