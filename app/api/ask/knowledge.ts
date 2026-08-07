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

/** Canonical portfolio data supplied to the terminal's Gemini prompt. */
export function portfolioKnowledge() {
  return {
    profile,
    status,
    heroStats,
    facts,
    experience,
    projects,
    skills,
    links,
  };
}
