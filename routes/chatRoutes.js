import express from "express";
import Product from "../model/Product.js";
import "dotenv/config";

const router = express.Router();

const memory = {};


function isListQuery(message) {
  const msg = message.toLowerCase();

  return (
    msg.includes("list") ||
    msg.includes("kon kon") ||
    msg.includes("kaun kaun") ||
    msg.includes("kya kya") ||
    msg.includes("show") ||
    msg.includes("available")
  );
}


function isPriceQuery(message) {
  const msg = message.toLowerCase();

  return (
    msg.includes("price") ||
    msg.includes("kitna") ||
    msg.includes("rate") ||
    msg.includes("cost") ||
    msg.includes("paisa")
  );
}


// 🧠 DETECT INTENT
function detectIntent(message) {
  const msg = message.toLowerCase();

  return {
    kitchen: msg.includes("kitchen"),
    bathroom: msg.includes("bathroom"),
    flooring: msg.includes("floor"),
    cheap: msg.includes("cheap") || msg.includes("low"),
    premium: msg.includes("premium") || msg.includes("luxury"),
  };
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const userId = req.ip;

    const listMode = isListQuery(message);
    const priceMode = isPriceQuery(message);
    const intent = detectIntent(message);


    if (!memory[userId]) memory[userId] = [];
    memory[userId].push(message);
    const lastMessages = memory[userId].slice(-5);


    let products = await Product.find({
      $or: [
        { name: { $regex: message, $options: "i" } },
        { description: { $regex: message, $options: "i" } },
        { "specifications.color": { $regex: message, $options: "i" } },
        { "specifications.application": { $regex: message, $options: "i" } }
      ]
    });

    if (products.length === 0) {
      products = await Product.find().limit(3);
    }

    products = products.slice(0, 5);


    let aiInstruction = "";


    if (priceMode) {
      aiInstruction = `
You are a marble sales assistant.

LANGUAGE RULES:
- If user writes in Roman Urdu, ALWAYS reply in Roman Urdu.
- NEVER reply in Hindi script.
- NEVER reply in Urdu script.
- Use English letters only.

RULES:
- User is asking for price
- Do NOT give fake price
- Always ask user to contact owner
- Provide contact number suggestion

Contact format:
"Please contact our sales team at 0318-3822290 for exact quotation."
`;
    }


    //  LIST MODE
    else if (listMode) {
      aiInstruction = `
LANGUAGE RULES:
- If user writes in Roman Urdu, ALWAYS reply in Roman Urdu.
- NEVER reply in Hindi script.
- NEVER reply in Urdu script.
- Use English letters only.

User wants ONLY product list.

RULES:
- Only show product names
- No explanation
- Very short response
`;
    }


    //  SALES MODE
    else {
      aiInstruction = `
You are a professional marble sales assistant AI.

LANGUAGE RULES:
- If user writes in Roman Urdu, ALWAYS reply in Roman Urdu.
- NEVER reply in Hindi script.
- NEVER reply in Urdu script.
- Use English letters only.
- If user writes in English, reply in English.
- For other languages, reply in the same language.

RULES:
- Understand user intent (kitchen, bathroom, flooring, cheap, luxury)
- Use chat history for context
- Recommend best products first
- If no exact match, suggest alternatives
- Keep response short, friendly and sales-focused
`;
    }


    //  GEMINI API CALL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
${aiInstruction}

User message:
${message}

Chat history:
${JSON.stringify(lastMessages)}

Detected intent:
${JSON.stringify(intent)}

Products:
${JSON.stringify(products)}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );


    const data = await response.json();


    //  SAFE RESPONSE HANDLING
    let aiReply = "Sorry, I couldn't generate response.";

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      aiReply = data.candidates[0].content.parts[0].text;
    } else {
      console.log("Gemini Error:", JSON.stringify(data, null, 2));
    }


    // 📤 FINAL RESPONSE
    res.json({
      success: true,
      message: aiReply,
      products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;