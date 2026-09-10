const fs = require("fs");

function clusterFailures() {
  const results = JSON.parse(fs.readFileSync("data/results.json"));
  const groundTruth = JSON.parse(fs.readFileSync("data/ground_truth.json"));

  const failures = results.results.filter((r) => !r.correct);

  const clusters = {
    missing_aws: [],
    years_mismatch: [],
    language_mismatch: [],
    other: [],
  };

  for (const failure of failures) {
    const testCase = groundTruth.find((t) => t.id === failure.id);

    if (testCase.reason.includes("No AWS")) {
      clusters.missing_aws.push({ id: failure.id, case: testCase });
    } else if (testCase.reason.includes("years")) {
      clusters.years_mismatch.push({ id: failure.id, case: testCase });
    } else if (testCase.reason.includes("language")) {
      clusters.language_mismatch.push({ id: failure.id, case: testCase });
    } else {
      clusters.other.push({ id: failure.id, case: testCase });
    }
  }

  console.log(`\n=== FAILURE CLUSTERS ===`);
  console.log(
    `\nCluster 1: Missing AWS (${clusters.missing_aws.length} failures)`
  );
  console.log(
    `Cause: System doesn't require AWS if not explicitly mentioned in resume.`
  );
  console.log(`Example: Case ${clusters.missing_aws[0]?.id}`);
  console.log(
    `Fix: Add explicit AWS requirement check in prompt.`
  );

  console.log(
    `\nCluster 2: Years Mismatch (${clusters.years_mismatch.length} failures)`
  );
  console.log(`Cause: System misinterprets experience years or converts inconsistently.`);
  console.log(`Example: Case ${clusters.years_mismatch[0]?.id}`);
  console.log(`Fix: Parse years with regex, validate against JD requirement.`);

  console.log(
    `\nCluster 3: Language Mismatch (${clusters.language_mismatch.length} failures)`
  );
  console.log(`Cause: System doesn't distinguish primary vs secondary language.`);
  console.log(`Example: Case ${clusters.language_mismatch[0]?.id}`);
  console.log(`Fix: Check if Python is PRIMARY language mentioned first.`);

  fs.writeFileSync("data/clusters.json", JSON.stringify(clusters, null, 2));
  console.log(`\nClusters saved to data/clusters.json`);
}

clusterFailures();