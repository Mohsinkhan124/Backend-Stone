import express from "express";
import Product from "../model/Product.js";
import "dotenv/config";
import Category from "../model/Category.js";

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
// NOTE: kitchen/bathroom/flooring/outdoor flags are kept ONLY because the
// Gemini prompt below still references "Detected intent" for tone/context
// (cheap/premium are also still used there). They are NO LONGER used for
// category matching — that's now fully dynamic (see detectCategory below).
function detectIntent(message) {
  const msg = message.toLowerCase();

  return {
    kitchen: msg.includes("kitchen"),
    bathroom: msg.includes("bathroom"),
    flooring: msg.includes("floor"),
    outdoor: msg.includes("outdoor"),
    cheap: msg.includes("cheap") || msg.includes("low"),
    premium: msg.includes("premium") || msg.includes("luxury"),
  };
}

// ----------------------------------------------------------------
// IMPROVEMENT 2: DYNAMIC CATEGORY DETECTION
//
// Instead of hardcoded if/else checks against fixed slugs (bathroom,
// kitchen, flooring, outdoor), this pulls ALL categories from the DB
// and checks if the user's message mentions any category's `name` or
// `slug`. This means any category you add later (Bedroom, Stairs,
// Living Room, etc.) is automatically detected with zero code changes.
// ----------------------------------------------------------------
async function detectCategory(message) {
  const msg = message.toLowerCase();
  const categories = await Category.find({});

  return (
    categories.find((cat) => {
      const name = (cat.name || "").toLowerCase();
      const slug = (cat.slug || "").toLowerCase();
      return (
        (name && msg.includes(name)) ||
        (slug && msg.includes(slug))
      );
    }) || null
  );
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

    // ----------------------------------------------------------------
    // PRODUCT RECOMMENDATION LOGIC
    //
    // `products` is assigned exactly once at the end of this block.
    //
    // Resolution order:
    //   1. Dynamic category match (any category in the DB, by name or
    //      slug) -> return ONLY that category's products
    //   2. No category matched -> text search across name / description
    //      / specifications.application / specifications.color
    //   3. Still nothing found (IMPROVEMENT 1) -> fall back to the
    //      first 3 products in the catalog so the AI always has
    //      something to recommend instead of an empty list
    //   4. Final safety net (IMPROVEMENT 1) -> results are always
    //      capped at a maximum of 5 products
    // ----------------------------------------------------------------

    const matchedCategory = await detectCategory(message);

    let products;

    if (matchedCategory) {
      // Step 1: category identified dynamically — return ONLY its products
      products = await Product.find({ category: matchedCategory._id });
    } else {
      // Step 2: no category matched, fall back to text search
      products = await Product.find({
        $or: [
          { name: { $regex: message, $options: "i" } },
          { description: { $regex: message, $options: "i" } },
          { "specifications.application": { $regex: message, $options: "i" } },
          { "specifications.color": { $regex: message, $options: "i" } },
        ],
      });
    }

    // Step 3: if everything above returned nothing, fall back to the
    // first 3 products in the catalog as generic recommendations
    if (!products || products.length === 0) {
      products = await Product.find({}).limit(3);
    }

    // Step 4: hard cap — never send more than 5 products to the AI/UI
      products = products.slice(0, 3);
    

    let aiInstruction = "";


    if (priceMode) {
      aiInstruction = `
You are a marble sales assistant.

RULES:
- User is asking for price
- Do NOT give fake price
- Always ask user to contact owner
- Provide contact number suggestion
- Be polite and helpful

Contact format:
"Please contact our sales team at 0318-3822290 for exact quotation."
`;
    }


    //  LIST MODE
    else if (listMode) {
      aiInstruction = `
User wants ONLY product list.

RULES:
- Only show product names
- No explanation
- No marketing
- Very short response
`;
    }


    //  SALES MODE
    else {
      aiInstruction = `
You are a professional marble sales assistant AI.

RULES:
- Understand the user's intent and recommend products based on the detected product category.
If products are provided, recommend only those products.
Never recommend products outside the provided product list.
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