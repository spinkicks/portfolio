"use client";

import React, { useEffect, useState } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Sparkles,
  Loader,
} from "lucide-react";

// props passed to the component from parent
type AltSiteProps = {
  onBack: () => void;
};

// talks to gemini api and gets responses based on prompts
const callGemini = async (prompt: string, systemInstruction = "") => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Access the environment variable

  if (!apiKey) {
    console.error("error, missing api key");
    return "Error: missing my api key";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response data found"
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Sorry. Seems as if I ran out of my LLM's API credits.";
  }
};

// all the portfolio data in one place
const DATA = {
  name: "David O.",
  title: "CS Student @ UT Austin",
  email: "fear@utexas.edu",
  socials: {
    github: "https://github.com/spinkicks",
    linkedin: "https://www.linkedin.com/in/calmguy/",
    portfolio: "#",
  },
  about: [
    {
      label: "Previously",
      text: "AI/ML Intern at Mercor Intelligence, Researcher at University of Houston",
    },
    {
      label: "Currently",
      text: "Studying Computer Science & Data Science at UT Austin",
    },
    {
      label: "Interests",
      text: "Machine Learning, Full-Stack Dev, Scalable Solutions, Data Manipulation and Analysis",
    },
  ],
  experience: [
    {
      company: "Mercor Intelligence",
      role: "AI/ML Intern",
      period: "Feb 2025 - April 2025",
      description:
        "Engineered Python scripts to analyze LLM failures and optimize training data. Increased AI accuracy by ~0.5% through targeted data analysis on mathematical reasoning tasks.",
    },
    {
      company: "University of Houston",
      role: "Machine Learning Researcher & SWE Intern",
      period: "May 2023 - Aug 2023",
      description:
        "Built real-time embedded system simulations using Python, SUMO, and Flow to investigate traffic paradoxes. Developed TraCI API scripts for programmatic simulation control.",
    },
    {
      company: "Project: Empower",
      role: "Chief Operations Officer",
      period: "Aug 2022 - Jan 2024",
      description:
        "Scaled 501c3 org to 100+ members and 10+ chapters. Orchestrated a $100k hackathon. Collaborated on full-stack dev (Next.js, Node, Supabase).",
    },
  ],
  projects: [
    {
      name: "Illuminate",
      tech: "Next.js, React, Supabase, Tailwind",
      description:
        "Searchable database of ~400 high school extracurriculars. Scaled to serve massive traffic, integrated GA4, and built a responsive UI.",
      url: "https://illuminate.projectempower.io/",
    },
    {
      name: "Tendir",
      tech: "Vue, Node.js, TypeScript, Opentender",
      description:
        "Fintech web app for organizing official contracts (tenders). Won 1st Place Best Fintech Hack at Fintectual.",
      url: "https://devpost.com/software/tender-d70yp5",
    },
    {
      name: "STEM Today",
      tech: "HTML/CSS, JS",
      description:
        "Science communication platform reaching ~9k followers. Directed a 140+ member team to make complex research accessible.",
      url: "https://sciencehowitworks.wixsite.com/my-site-1",
      socialUrl: "https://www.instagram.com/stemtoday/",
    },
  ],
  skills: [
    "Python",
    "Java",
    "C/C++",
    "SQL",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "LaTeX",
    "NumPy",
    "Git",
    "Google Cloud",
  ],
};

// --- Components ---
const Section = ({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) => (
  // reusable section component with a random hex id and border styling
  <section id={id} className="mb-16 animate-fade-in">
    <h2 className="text-indigo-400 font-bold text-lg mb-6 flex items-center gap-2 select-none">
      <span className="text-zinc-600">
        0x{Math.floor(Math.random() * 99).toString(16).padStart(2, "0")}
      </span>
      {title.toLowerCase()}
    </h2>
    <div className="pl-4 ml-1">{children}</div>
  </section>
);

// displays a single project card with ai audit capability
const ProjectCard = ({ project }: { project: (typeof DATA.projects)[0] }) => {
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // triggers ai analysis of the project tech stack
  const handleAudit = async () => {
    if (auditResult) return;
    setLoading(true);
    const systemPrompt =
      "You are a senior cyberpunk systems architect. Analyze the given project tech stack and description. Explain succinctly why this stack is effective or suggest a futuristic improvement. Keep it under 2 sentences. Use technical, hacker-like jargon.";
    const userPrompt = `Project: ${project.name}. Tech: ${project.tech}. Desc: ${project.description}`;

    const text = await callGemini(userPrompt, systemPrompt);
    setAuditResult(text);
    setLoading(false);
  };

  return (
    <div className="group border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/50 hover:bg-zinc-900/50 p-5 transition-all duration-300 rounded-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">
          {project.name}
        </h3>
        <div className="flex gap-2">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.socialUrl && (
            <a
              href={project.socialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.011 4.85.07 3.252.148 4.771 1.691 4.919 4.919.059 1.266.07 1.646.07 4.85s-.011 3.584-.07 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.059-1.644.07-4.85.07s-3.584-.011-4.85-.07c-3.251-.149-4.771-1.699-4.919-4.92-.059-1.266-.07-1.644-.07-4.849s.011-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
              </svg>
            </a>
          )}
        </div>
      </div>
      <p className="text-zinc-400 text-sm mb-4 min-h-[60px]">
        {project.description}
      </p>

      <div className="mb-4">
        {!auditResult && !loading && (
          <button
            onClick={handleAudit}
            className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/10 transition-colors"
          >
            <span>AI System Audit</span>
          </button>
        )}

        {loading && (
          <div className="text-[10px] flex items-center gap-2 text-zinc-500 animate-pulse">
            <Loader size={10} className="animate-spin" />
            <span>RUNNING DIAGNOSTICS...</span>
          </div>
        )}

        {auditResult && (
          <div className="text-xs text-indigo-300/90 font-mono bg-zinc-950/50 p-2 border-l-2 border-indigo-500 animate-fade-in">
            <span className="text-indigo-500 font-bold mr-2">{">"}</span>
            {auditResult}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto border-t border-zinc-800/50 pt-3">
        {project.tech.split(", ").map((t, i) => (
          <span
            key={i}
            className="text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded-sm"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const AsciiHeader = () => (
  // fancy ascii art header that fades in on hover
  <pre className="text-[10px] sm:text-xs leading-[10px] sm:leading-3 text-zinc-500 font-bold mb-8 select-none opacity-50 hover:opacity-100 transition-opacity duration-500 overflow-x-hidden">
{`
    .___           .__    .___
  __| _/____ ___  _|__| __| _/
 / __ |\\__  \\  \\/ /  |/ __ | 
/ /_/ | / __ \\   /|  / /_/ | 
\\____ |(____  /\\_/ |__\\____ | 
     \\/     \\/             \\/ 
`}
  </pre>
);

// terminal-style input bar where users type commands
const CommandInput = ({
  onCommand,
  isLoading,
}: {
  onCommand: (input: string) => void;
  isLoading: boolean;
}) => {
  const [input, setInput] = useState("");

  // handles form submission and passes command up to parent
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onCommand(input.trim());
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur border-t border-zinc-800 p-2 flex items-center gap-2 text-sm z-50"
    >
      <span className="text-green-700 font-bold">
        visitor@david-portfolio:~$
      </span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        className={`bg-transparent border-none outline-none text-zinc-300 flex-1 font-mono ${
          isLoading ? "opacity-50 cursor-wait" : ""
        }`}
        placeholder={isLoading ? "processing..." : "type 'help' or ask a question about my profile with 'ask <question>'; 'ask is he good at web dev'..."}
        autoFocus
      />
    </form>
  );
};

// each entry in the console log includes command response and when it happened
type ConsoleEntry = { cmd: string; response: string | null; timestamp: number };

export default function AltSite({ onBack }: AltSiteProps) {
  const [consoleLog, setConsoleLog] = useState<ConsoleEntry[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [, setForceUpdate] = useState(0);

  // force component to re-render every 100ms so the animations trigger properly
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // remove console entries that are older than 5 seconds
  useEffect(() => {
    if (consoleLog.length === 0) return;

    const timer = setTimeout(() => {
      setConsoleLog((prev) => {
        const now = Date.now();
        return prev.filter((log) => now - log.timestamp < 11000); // use this effect for 11 seconds
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [consoleLog]);

  // smoothly scroll to a section by its id
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // main handler that processes terminal commands from user input
  const handleCommand = async (rawCmd: string) => {
    const parts = rawCmd.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    // add the command to the log immediately
    setConsoleLog((prev) => [...prev, { cmd: rawCmd, response: null, timestamp: Date.now() }]);

    // helper to set the response for the most recent log entry
    const finish = (text: string) => {
      setConsoleLog((prev) =>
        prev.map((log, idx) =>
          idx === prev.length - 1 ? { ...log, response: text } : log
        )
      );
    };

    // handle different terminal commands
    switch (cmd) {
      case "help":
        finish(
          "Available commands: about, exp, projects, skills, social, clear, ask <question>"
        );
        break;
      case "about":
        scrollToSection("about");
        finish("Navigating to About section...");
        break;
      case "exp":
        scrollToSection("experience");
        finish("Navigating to Experience...");
        break;
      case "projects":
        scrollToSection("projects");
        finish("Listing Projects...");
        break;
      case "skills":
        scrollToSection("skills");
        finish("Loading skill matrix...");
        break;
      case "social":
        finish("Github: github.com | LinkedIn: linkedin.com");
        break;
      case "clear":
        // clear all console entries
        setConsoleLog([]);
        break;
      case "ask":
        // ask the ai anything based on data in the portfolio
        if (!args) {
          finish("Error: usage 'ask <question>'. Example: 'ask what is his gpa?'");
          return;
        }
        setIsAiProcessing(true);
        const systemPrompt = `You are a terminal interface assistant for David O's portfolio. You have access to the following JSON data about him: ${JSON.stringify(
          DATA
        )}. Answer the user's question briefly and accurately based strictly on this data. Use a cool, slightly robotic or hacker-like tone. If the answer isn't in the data, say "Data corrupted or missing."`;
        const aiResponse = await callGemini(args, systemPrompt);
        finish(aiResponse);
        setIsAiProcessing(false);
        break;
      default:
        finish(`Command not found: ${cmd}. Type 'help'.`);
    }
  };

  // typewriter effect for intro text
  const [typedText, setTypedText] = useState("");
  const fullText = "Welcome to my low-profile version. I build intelligent systems and scalable apps.";

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [typedText, fullText]);

  return (
    // main container with grid background and dark theme
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-indigo-500/30 selection:text-indigo-200 pb-20">
      {/* subtle grid pattern background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0 opacity-20" />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* button to switch back to main portfolio view */}
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={onBack}
            className="text-xs border border-zinc-800 px-3 py-1 rounded bg-zinc-900/60 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
          >
            Switch Site Layout
          </button>
        </div>

        <header className="mb-20">
          <AsciiHeader />

          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">
            {DATA.name}
          </h1>
          <p className="text-indigo-400 mb-8 text-lg">{DATA.title}</p>

          {/* typewriter effect intro */}
          <div className="h-16 mb-8 text-zinc-400 leading-relaxed max-w-xl">
            <span className="mr-2 text-green-700">➜</span>
            {typedText}
            <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-green-700 align-middle"></span>
          </div>

          {/* navigation buttons for each section */}
          <nav className="flex flex-wrap gap-4 text-sm">
            {["About", "Experience", "Projects", "Skills"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="group flex items-center gap-2 hover:text-indigo-400 transition-colors"
              >
                <span className="text-zinc-600 group-hover:text-indigo-400/50">
                  [
                </span>
                {item}
                <span className="text-zinc-600 group-hover:text-indigo-400/50">
                  ]
                </span>
              </button>
            ))}
          </nav>
        </header>

        <Section title="About_Me" id="about">
          <div className="space-y-4">
            {/* display about section items with labels */}
            {DATA.about.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4"
              >
                <span className="text-zinc-500 underline decoration-zinc-700 decoration-dotted underline-offset-4">
                  {item.label}:
                </span>
                <span className="text-zinc-300">
                  {/* highlight certain keywords in the text */}
                  {item.text.split(" ").map((word, i) => {
                    const highlights = [
                      "Mercor",
                      "Houston",
                      "UT",
                      "Austin",
                      "AI/ML",
                      "Full-Stack",
                      "Quantum",
                    ];
                    const isHighlight = highlights.some((h) => word.includes(h));
                    return isHighlight ? (
                      <span key={i} className="text-indigo-300 font-medium">
                        {word}{" "}
                      </span>
                    ) : (
                      <span key={i}>{word} </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Experience_Log" id="experience">
          <div className="relative border-l border-zinc-800 ml-3 space-y-12">
            {/* display each job with a timeline dot */}
            {DATA.experience.map((job, idx) => (
              <div key={idx} className="relative pl-8 group">
                {/* timeline dot that changes color on hover */}
                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-300" />

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                  <h3 className="text-lg font-bold text-zinc-200 group-hover:text-indigo-300 transition-colors">
                    {job.company}
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    {job.period}
                  </span>
                </div>

                <div className="text-sm text-indigo-400/80 mb-3 font-mono border border-indigo-500/20 bg-indigo-500/5 inline-block px-2 py-0.5 rounded">
                  {job.role}
                </div>

                <p className="text-zinc-400 leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Project_Index" id="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* render each project as a card with ai audit feature */}
            {DATA.projects.map((project, idx) => (
              <ProjectCard key={idx} project={project} />
            ))}
          </div>
        </Section>

        <Section title="Tech_Stack" id="skills">
          <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm">
              {/* display each skill with a directory-style prefix */}
              {DATA.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <span className="text-zinc-700 group-hover:text-indigo-500 transition-colors">
                    ./
                  </span>
                  <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* footer with social links */}
        <footer className="mt-20 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
          {/* social media icons */}
          <div className="flex gap-4">
            <a
              href={DATA.socials.github}
              className="hover:text-indigo-400 transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href={DATA.socials.linkedin}
              className="hover:text-indigo-400 transition-colors"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={`mailto:${DATA.email}`}
              className="hover:text-indigo-400 transition-colors"
            >
              <Mail size={18} />
            </a>
          </div>
          <p>© 2025 spinkicks. EOF.</p>
        </footer>
      </main>

      {/* floating console output display */}
      <div className="fixed bottom-12 left-0 w-full pointer-events-none px-6 z-40">
        <div className="max-w-3xl mx-auto flex flex-col items-start gap-1">
          {/* only show the 3 most recent commands and fade them out */}
          {consoleLog.slice(-3).map((log, i) => {
            const age = Date.now() - log.timestamp;
            const shouldShow = age < 11000;
            if (!shouldShow) return null;
            
            return (
              <div
                key={i}
                className="bg-zinc-950/90 border border-zinc-800 p-2 text-xs font-mono rounded shadow-xl animate-fade-in-up"
                style={{
                  // trigger fadeOut animation when entry reaches 10 seconds old
                  animation: age > 10000 ? `fadeOut 1s ease-out forwards` : "none",
                }}
              >
                <span className="text-green-700">➜</span>{" "}
                <span className="text-zinc-400">{log.cmd}</span>
                <div className="text-indigo-300 mt-1 pl-4">
                  {/* show loading indicator while processing, then show response */}
                  {log.response === null ? (
                    <span className="animate-pulse">_processing...</span>
                  ) : (
                    log.response
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* terminal input at the bottom */}
      <CommandInput onCommand={handleCommand} isLoading={isAiProcessing} />

      {/* all animations defined here */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
