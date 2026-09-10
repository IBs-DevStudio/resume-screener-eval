const fs = require("fs");
const { execSync } = require("child_process");
const { detectHallucinations } = require("./hallucination");

const groundTruth = JSON.parse(fs.readFileSync("data/ground_truth.json"));

async function runEvals() {
  const results = [];
  const hallucinations = [];
  const confidenceBuckets = {
    "0-0.2": { correct: 0, total: 0 },
    "0.2-0.4": { correct: 0, total: 0 },
    "0.4-0.6": { correct: 0, total: 0 },
    "0.6-0.8": { correct: 0, total: 0 },
    "0.8-1.0": { correct: 0, total: 0 },
  };

  for (const test of groundTruth) {
    try {
      const cmd = `python screener.py "${test.resume.replace(/"/g, '\\"')}" "${test.job_description.replace(/"/g, '\\"')}"`;
      const output = execSync(cmd, { encoding: "utf-8" });
      const prediction = JSON.parse(output);

      const correct = (test.ground_truth === "pass") === prediction.pass;

      // Check for hallucinations
      const issues = detectHallucinations(test.resume, prediction.reasoning);
      if (issues.length > 0) {
        hallucinations.push({ id: test.id, issues });
      }

      // Calibration bucketing
      const conf = prediction.confidence;
      let bucket;
      if (conf < 0.2) bucket = "0-0.2";
      else if (conf < 0.4) bucket = "0.2-0.4";
      else if (conf < 0.6) bucket = "0.4-0.6";
      else if (conf < 0.8) bucket = "0.6-0.8";
      else bucket = "0.8-1.0";

      confidenceBuckets[bucket].total++;
      if (correct) confidenceBuckets[bucket].correct++;

      results.push({
        id: test.id,
        correct,
        confidence: prediction.confidence,
        predicted: prediction.pass,
        ground_truth: test.ground_truth === "pass",
      });
    } catch (e) {
      console.error(`Failed on case ${test.id}: ${e.message}`);
    }
  }

  // Calculate metrics
  const accuracy =
    (results.filter((r) => r.correct).length / results.length) * 100;
  const hallRate =
    (hallucinations.length / results.length) * 100;

  console.log(`\n=== EVALUATION REPORT ===`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
  console.log(`Hallucination Rate: ${hallRate.toFixed(2)}%`);
  console.log(`Total Cases: ${results.length}`);

  console.log(`\n=== CONFIDENCE CALIBRATION ===`);
  for (const [bucket, data] of Object.entries(confidenceBuckets)) {
    if (data.total > 0) {
      const rate = (data.correct / data.total) * 100;
      console.log(
        `${bucket}: ${rate.toFixed(2)}% accuracy (${data.correct}/${data.total})`
      );
    }
  }

  // Save results
  fs.writeFileSync(
    "data/results.json",
    JSON.stringify(
      {
        accuracy,
        hallucination_rate: hallRate,
        results,
        hallucinations,
        calibration: confidenceBuckets,
      },
      null,
      2
    )
  );

  console.log(`\nResults saved to data/results.json`);
}

runEvals();