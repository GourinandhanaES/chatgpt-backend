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
            - Only respond with the exact answer found in the uploaded documents.
            - If the user query asks for a **list or overview**, return only the main headings or types, without including the detailed questions and answers under them.
            - Add a short introductory sentence before listing the answer to give context (e.g., "We offer a variety of bespoke driving courses tailored to meet different needs:").
            - Add a friendly concluding sentence after the list (e.g., "Feel free to ask if you need further details on any specific course!").
            - Do not add any extra text, explanations, headers, or clarifications.
            - Return the text exactly as it appears in the document.
            - If no exact match is found, return the closest matching answer from the documents.
            - Never generate your own answers or extra commentary.
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
//           content: `
//             You are a helpful assistant for Drivers Domain UK (DDUK).
//             Always respond as if the user is asking about our driving courses and services,
//             even if DDUK is not explicitly mentioned.
//             If an answer is found in the files, return it **verbatim** without summarizing, shortening, or adding extra details.
//             Use the most relevant info from the uploaded documents in the linked vector store.
//           `
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




