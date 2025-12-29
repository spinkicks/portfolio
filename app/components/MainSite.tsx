"use client";

import SynthMoon from "./SynthMoon";
import TypingTest from "./TypingTest";

const GLASS_CARD_CLASSES = "glass-card rounded-none shadow-[0_0_25px_rgba(122,166,199,0.12)]";

// props for switching between site layouts
type MainSiteProps = {
  onSwitch: () => void;
};

// main portfolio page with animated moon, intro, projects, skills, experience, and typing test
export default function MainSite({ onSwitch }: MainSiteProps) {
  return (
    <main className="relative min-h-[300vh] bg-black overflow-x-hidden">
      {/* background image with overlay for depth */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/moonless-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* animated moon that moves across screen as user scrolls */}
      <SynthMoon />

      {/* main content container with all sections */}
      <div className="relative z-20 w-full max-w-6xl mx-auto pt-80 px-6 pb-24 space-y-8">
        {/* intro centered with button positioned to the right (button absolutely positioned) */}
        <div className="w-full">
          <div className="relative w-fit mx-auto">
            <section className={`w-fit p-8 ${GLASS_CARD_CLASSES}`}>
              <h1 className="text-7xl font-extrabold font-mono text-cyan-100 tracking-tighter text-center glow-cyan">
                David O.
              </h1>
              <p className="mt-4 text-cyan-200 font-mono text-2xl text-center">
                Austin, TX
              </p>
            </section>

            <button
              type="button"
              onClick={onSwitch}
              className="absolute left-full ml-4 top-3/4 -translate-y-1/2 inline-flex items-center whitespace-nowrap glass-card px-4 py-2 font-mono text-sm border border-cyan-500/20 transform transition-transform duration-200 hover:scale-105 hover:bg-blue-600 hover:text-white hover:shadow-[0_8px_30px_rgba(72,178,255,0.08)]"
            >
              Switch Site Layout
            </button>
          </div>
        </div>

        {/* short bio about background and interests */}
        <section className={`w-full max-w-4xl mx-auto p-6 ${GLASS_CARD_CLASSES}`}>
          <p className="text-cyan-200 font-mono text-base leading-relaxed">
            I&apos;m a CS student at the University of Texas at Austin, minoring in Statistics & Data Science. My technical background spans AI/ML engineering and full-stack development. I&apos;m passionate about scalable solutions. I also type fast... (check the bottom of the page).
          </p>
        </section>

        {/* three-column layout for projects, skills, and contact info */}
        <div className="grid gap-8 md:grid-cols-3 items-start justify-items-center">
          <section className={`w-full max-w-sm p-8 ${GLASS_CARD_CLASSES}`}>
            <h2 className="text-3xl font-bold text-cyan-100 mb-4 font-mono glow-cyan text-center">
              Projects
            </h2>
            {/* list of notable projects with links */}
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
              <p>
                4.{" "}
                <a
                  href="https://sciencehowitworks.wixsite.com/my-site-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-100 hover:underline"
                >
                  STEM Today
                </a>{" "}
                [HTML/CSS]
              </p>
              <p>4. Heap Memory Allocator [C]</p>
            </div>
          </section>

          <section className="w-full max-w-sm p-8 glass-card rounded-none shadow-[0_0_25px_rgba(122,166,199,0.12)]">
            <h2 className="text-3xl font-bold text-cyan-100 mb-4 font-mono glow-cyan text-center">
              Skills
            </h2>
            {/* technical skills broken down by category */}
            <div className="space-y-3 font-mono text-cyan-200 text-sm leading-relaxed">
              <p>
                <span className="text-cyan-300">Languages:</span> Python, Java, C, C++, SQL, JavaScript, [Tailwind] CSS, LaTeX, Spanish (Fluent)
              </p>
              <p>
                <span className="text-cyan-300">Frameworks & Libraries:</span> MongoDB, Next.js, React, Node.js, NumPy, Matplotlib, Bootstrap
              </p>
              <p>
                <span className="text-cyan-300">Tools & Technologies:</span> Supabase, Google Cloud VM, Cloudflare R2, Git, Google Analytics (GA4), Google Tag Manager, Excel
              </p>
            </div>
          </section>

          <section className="w-full max-w-sm p-8 glass-card rounded-none shadow-[0_0_25px_rgba(122,166,199,0.12)]">
            <h2 className="text-3xl font-bold text-cyan-100 mb-4 font-mono glow-cyan text-center">
              Contact
            </h2>
            {/* social media and profile links */}
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
                MonkeyType (#500 Global)
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

        {/* work experience with flip card animations to reveal details */}
        <section className="p-8 glass-card rounded-none shadow-[0_0_25px_rgba(122,166,199,0.12)] space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-4xl font-bold font-mono text-cyan-100 glow-cyan">Experience</h2>
            <p className="text-sm text-cyan-200 font-mono">Highlights of my recent work.</p>
          </div>
          {/* flip cards show job titles on front and accomplishments on back */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="reveal-card">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-none flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">Mercor Intelligence</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">AI/ML Intern - Feb 2025 to Apr 2025</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-none h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Engineered Python scripts to analyze model failures and optimize training data for a leading LLM; formatted datasets in LaTeX.</li>
                  <li>Applied discrete math/stats/calculus to improve evaluation workflows.</li>
                  <li>Drove ~0.5% accuracy gain via targeted analysis of frequent errors.</li>
                </ul>
              </div>
            </div>

            <div className="reveal-card">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-none flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">University of Houston</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">ML Researcher & SWE Intern - May 2023 to Aug 2023</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-none h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Built/analyzed traffic simulations (Python, SUMO, Flow) to study flow phenomena and paradoxes.</li>
                  <li>Used TraCI API to control simulations and collect data validating real-world models.</li>
                </ul>
              </div>
            </div>

            <div className="reveal-card sm:col-span-2">
              <div className="reveal-front glass-card border border-cyan-500/20 p-5 rounded-none flex flex-col justify-between h-full w-full">
                <h3 className="text-2xl font-mono text-cyan-100">Project: Empower</h3>
                <p className="text-sm font-mono text-cyan-300 mt-1">Chief Operations Officer - Aug 2022 to Jan 2024</p>
              </div>
              <div className="reveal-back glass-card border border-cyan-500/20 p-6 rounded-none h-full w-full">
                <ul className="space-y-2 text-cyan-200 font-mono text-sm leading-relaxed">
                  <li>Scaled a 501c3 to 100+ members across 10+ chapters; led chapter teams.</li>
                  <li>Orchestrated a $100k DevPost hackathon.</li>
                  <li>Collaborated on Next.js frontend and Node/Supabase/SQL backend.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* typing speed challenge with wpm calculation */}
        <TypingTest />
      </div>
    </main>
  );
}
