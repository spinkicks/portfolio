import SynthMoon from "./components/SynthMoon";

export default function Home() {
  return (
    <main className="relative min-h-[300vh] bg-black overflow-x-hidden">
      
      {/* background is the synth-bg image*/}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: "url('/synth-bg.png')" }}
      >
        {/*dark overlay so text pops */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. moving moon layer */}
      <SynthMoon />

      {/* 3. scrollable content layer (todo, fix space in between) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto pt-48 px-6 pb-24 space-y-96">
        
        {/* Section 1: top */}
        <section className="p-8 bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter">
            David "Spinkicks"
          </h1>
          <p className="mt-4 text-cyan-100 font-mono text-lg">
            Austin, TX
          </p>
        </section>

        {/* Section 2: middle (Moon is at peak) */}
        <section className="p-8 bg-black/50 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <h2 className="text-3xl font-bold text-purple-400 mb-4 font-mono">
            &gt; Projects
          </h2>
          <div className="space-y-4 text-zinc-300">
            <p>1. Illuminate [Next.js]</p>
            <p>2. Tendir (Typescript)</p>
            <p>3. PintOS Kernel [C]</p>
          </div>
        </section>

        {/* Section 3: bottom (moon sets) */}
        <section className="p-8 bg-black/50 backdrop-blur-md border border-pink-500/30 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.15)]">
          <h2 className="text-3xl font-bold text-pink-500 mb-4 font-mono">
            &gt; Contact
          </h2>
          <a href="https://github.com/spinkicks" className="text-blue-600 hover:underline"> GitHub: spinkicks </a>
          
        </section>

      </div>
    </main>
  );
}