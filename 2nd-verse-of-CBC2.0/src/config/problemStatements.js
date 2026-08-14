export const PROBLEM_STATEMENTS_CONFIG = {
  // ISO Date string for when the problem statements should be unlocked
  // For Oct 10 2026, 10:30 AM IST (which is +05:30)
  UNLOCK_DATE: "2026-10-10T10:30:00+05:30",
  
  STATEMENTS: [
    {
      id: 1,
      domain: "GenAI & LLMs",
      title: "Intelligent Code Reviewer",
      description: "Develop an AI agent that automatically reviews pull requests, suggests optimizations, and enforces security standards using an open-source LLM."
    },
    {
      id: 2,
      domain: "Web3 & Blockchain",
      title: "Decentralized Academic Credentials",
      description: "Build a trustless system for universities to issue diplomas and certificates on a blockchain network, allowing instant verification by employers."
    },
    {
      id: 3,
      domain: "IoT & Hardware",
      title: "Smart Water Management System",
      description: "Design an IoT-based system to detect water leaks in municipal pipelines in real-time using acoustic sensors and machine learning."
    },
    {
      id: 4,
      domain: "Cybersecurity",
      title: "Zero-Day Exploit Sandbox",
      description: "Create an isolated, virtualized environment that uses behavioral heuristics to identify and neutralize zero-day malware variants."
    }
  ]
};
