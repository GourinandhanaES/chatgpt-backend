import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;

app.post("/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
           content: `
            You are a helpful assistant for Drivers Domain UK (DDUK).
            Always respond as if the user is asking about our driving courses and services,
            even if DDUK is not explicitly mentioned.

            - Only use the exact information found in the uploaded documents. Do not add new facts.
            - Do not expand or add extra content beyond what is in the documents.
            - For all questions:
              * Add a short introductory sentence reflecting the user's question.
              * If the answer in the document is short, provide it as-is (formatted with line breaks if needed).
              * If the answer in the document is long, summarize the main points concisely.
              * Include a friendly concluding sentence such as "Feel free to ask if you need further details."
              * If the document contains a reference or link, include it.
            - For list, overview, or types questions:
                * Add a short introductory sentence reflecting the user's question.
                * Include only the headings or types exactly as in the document.
                * Add a short, friendly concluding sentence.
                * Include a reference or link if present in the document.
            - Format the answer for readability with line breaks, but do not add bullets, headings, or details that are not in the document.
            - If no exact match is found, return the closest matching answer from the documents.
          `
        },
        { role: "user", content: userMessage }
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [VECTOR_STORE_ID]
        }
      ],
      tool_choice: "required"
    });

    const assistantReply =
      response.output_text ||
      (response.output?.[0]?.content?.[0]?.text ?? "No response");

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));







// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import OpenAI from "openai";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;

// app.post("/chat", async (req, res) => {
//   try {
//     const { userMessage } = req.body;

//     const response = await client.responses.create({
//       model: "gpt-4.1-mini",
//       input: [
//         {
//           role: "system",
//            content: `
//             You are a helpful assistant for Drivers Domain UK (DDUK).
//             Always respond as if the user is asking about our driving courses and services,
//             even if DDUK is not explicitly mentioned.
//             - Only use the exact information found in the uploaded documents. Do not add any new facts.
//             - You may improve readability by:
//               * Adding headings, subheadings, or labels.
//               * Breaking text into bullets or separate lines.
//               * Slightly rephrasing for clarity, but do not change meaning.
//             - If the user query asks for a list, overview, or types (like course types), add:
//               * A short introductory sentence reflecting the user's question.
//               * A friendly concluding sentence after the list.
//             - For other questions, format the raw answer for clarity (line breaks, bullets, short clarifying phrases), and you may add a friendly conclusion if appropriate.
//             - Do not add any extra text, explanations, headers, or clarifications.
//             - Return the text exactly as it appears in the document.
//             - If no exact match is found, return the closest matching answer from the documents.
//             `
//         },
//         { role: "user", content: userMessage }
//       ],
//       tools: [
//         {
//           type: "file_search",
//           vector_store_ids: [VECTOR_STORE_ID]
//         }
//       ],
//       tool_choice: "required"
//     });

//     const assistantReply =
//       response.output_text ||
//       (response.output?.[0]?.content?.[0]?.text ?? "No response");

//     res.json({ reply: assistantReply });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(5000, () => console.log("✅ Server running on port 5000"));










