const fs = require("fs");

function detectHallucinations(resume, systemReasoning) {
  const issues = [];

  // Check 1: Years exaggeration
  const yearsMatch = systemReasoning.match(/(\d+)\s+years?/i);
  if (yearsMatch) {
    const claimed = yearsMatch[1];
    if (!resume.includes(claimed)) {
      issues.push({
        type: "years_exaggerated",
        claimed: `${claimed} years`,
        issue: "Years not in resume",
      });
    }
  }

  // Check 2: Skills claimed but not in resume
  const skills = ["Python", "AWS", "Java", "Docker", "Kubernetes"];
  for (const skill of skills) {
    if (
      systemReasoning.toLowerCase().includes(skill.toLowerCase()) &&
      !resume.toLowerCase().includes(skill.toLowerCase())
    ) {
      issues.push({
        type: "skill_hallucination",
        claimed: skill,
        issue: `${skill} claimed but not in resume`,
      });
    }
  }

  return issues;
}

module.exports = { detectHallucinations };