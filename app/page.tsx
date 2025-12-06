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
        <section className="w-fit mx-auto p-8 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <h1 className="text-5xl font-extrabold font-mono text-white-500 tracking-tighter text-center">
            David O.
          </h1>
          <p className="mt-4 text-cyan-100 font-mono text-lg text-center">
            Austin, TX
          </p>
        </section>

        {/* Section 2 & 3: Projects and Contact side by side */}
        <div className="flex gap-8 justify-center flex-wrap">
          <section className="w-fit p-8 bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <h2 className="text-3xl font-bold text-white-400 mb-4 font-mono">
              Projects
            </h2>
            <div className="space-y-4 text-cyan-300 font-mono">
              <p>1. <a href="https://illuminate.projectempower.io/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-200 hover:underline">Illuminate</a> [Next.js]</p>
              <p>2. <a href="https://devpost.com/software/tender-d70yp5" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-200 hover:underline">Tendir</a> (Typescript)</p>
              <p>3. PintOS Kernel [C]</p>
            </div>
          </section>

          <section className="w-fit p-8 bg-black/50 backdrop-blur-md border border-pink-500/30 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <h2 className="text-3xl font-bold text-white-400 mb-4 font-mono">
              Contact
            </h2>
            <div className="space-y-2">
              <a href="https://github.com/spinkicks" target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:text-cyan-200 hover:underline font-mono">GitHub</a>
              <a href="https://www.linkedin.com/in/calmguy/" target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:text-cyan-200 hover:underline font-mono">LinkedIn</a>
              <a href="https://monkeytype.com/profile/Dipslox" target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:text-cyan-200 hover:underline font-mono">MonkeyType</a>
              <a href="https://open.spotify.com/user/cxxo2nymwpjcgw7kz5cttbrhj?si=8a890bb5b6584942" target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:text-cyan-200 hover:underline font-mono">Spotify</a>
            </div>
            
          </section>
        </div>

        {/* Typing test section */}
        <TypingTest />

      </div>
    </main>
  );
}
