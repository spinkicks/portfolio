import {
  experience,
  facts,
  heroStats,
  links,
  profile,
  projects,
  skills,
  status,
} from "../../content";

function factValue(label: string) {
  const value = facts.find((fact) => fact.label === label)?.value;
  if (value === undefined) {
    throw new Error(`Missing canonical fact: ${label}`);
  }
  return value;
}

/** Canonical portfolio data supplied to the terminal's Gemini prompt. */
export function portfolioKnowledge() {
  return {
    profile,
    status,
    education: {
      classYear: heroStats[0].value,
      degree: factValue("Education"),
      minor: factValue("Minor"),
    },
    languages: factValue("Languages"),
    focus: factValue("Focus"),
    experience,
    projects,
    skills,
    links,
  };
}
