function generateAdversarial(resume, jd) {
  return [
    // Paraphrase
    {
      resume: resume.replace(/Python/g, "Py").replace(/AWS/g, "Amazon Web Services"),
      jd: jd.replace(/Python/g, "Py"),
      type: "paraphrase",
    },
    // Add noise
    {
      resume: resume + " Also knowledgeable in COBOL from 1990s.",
      jd: jd,
      type: "irrelevant_context",
    },
    // Hide key info
    {
      resume: resume.split(".").slice(1).join("."),
      jd: jd,
      type: "truncated",
    },
  ];
}

module.exports = { generateAdversarial };