const axios = require("axios");
require("dotenv").config();

async function screenResume(resume, jobDescription) {
  try {
    const response = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        messages: [
          {
            role: "user",
            content: `Resume screener. Decide if candidate qualifies.

Job: ${jobDescription}
Resume: ${resume}

JSON only: {"pass": bool, "score": 0-100, "reasoning": "...", "confidence": 0-1}`,
          },
        ],
        model: "moonshotai/kimi-k3",
        max_tokens: 300,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NIM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(JSON.parse(response.data.choices[0].message.content));
  } catch (error) {
    console.error(error.message);
  }
}

screenResume("John. 5 years Python. AWS.", "Senior Python. 3+ years. AWS.");