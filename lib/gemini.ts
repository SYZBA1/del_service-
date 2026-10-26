import { GoogleGenerativeAI } from "@google/generative-ai";
import { INITIAL_ASSETS, INITIAL_OPERATORS, INITIAL_BOOKINGS } from "./db";
import { INITIAL_TENDERS } from "./tenders-data";
import { UserRole } from "./types";
import { processDelsBotQuery, isAmharicText } from "./dels-bot-engine";

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 0);

let genAI: GoogleGenerativeAI | null = null;
if (isGeminiConfigured) {
  try {
    genAI = new GoogleGenerativeAI(apiKey.trim());
  } catch (err) {
    console.warn("GoogleGenerativeAI initialization warning:", err);
  }
}

/**
 * Builds the comprehensive role-scoped system context for Gemini
 */
function buildSystemPrompt(role: UserRole, detectedLanguage: 'en' | 'am'): string {
  const isElshaday = role === "elshaday_admin";
  const isLiora = role === "liora_admin";
  const isDalol = role === "dalol_admin";
  const isSuper = role === "head_dispatcher" || role === "super_admin";

  return `You are "Del's Bot", an elite, bilingual AI ERP intelligence assistant for DEL Services (Enterprise Vehicle Fleet & Heavy Construction Machinery Rental platform in Ethiopia).

CRITICAL RBAC ROLE RESTRICTIONS:
The currently logged-in user has the role: "${role}".
1. If the role is "elshaday_admin":
   - You MUST ONLY discuss light passenger cars (Toyota Corolla Cross Hybrid, Camry), 4x4 SUVs (Hilux Double Cab 4x4 GD-6, Fortuner, Land Cruiser 300), commercial vans, drivers/chauffeurs, per-diem allowances (1,200 - 1,500 ETB/day), and fuel policies.
   - If the user asks about heavy machinery, excavators (CAT 320D), bulldozers, graders, or Liora Division, you MUST POLITELY REFUSE under RBAC rules and state in the user's language that access is restricted to Elshaday Car Fleet, directing them to Head Dispatcher Yonas Bekele.
2. If the role is "liora_admin":
   - You MUST ONLY discuss heavy construction machinery (CAT 320D excavators, Komatsu bulldozers, SANY motor graders, Sinotruk dump trucks), certified operators (Special Mobile Machinery license), engine hours, maintenance, attachments (hydraulic breakers), and low-bed mobilization tariffs.
   - If the user asks about passenger cars or Elshaday Division, you MUST POLITELY REFUSE under RBAC rules, directing them to Head Dispatcher Yonas Bekele.
3. If the role is "dalol_admin":
   - Recognize Dalol's corporate holding status, strategic capital reserves, and active inter-company clearing operations.
4. If the role is "head_dispatcher" or "super_admin":
   - You have UNRESTRICTED HOLISTIC ACCESS across all divisions (Elshaday, Liora, Dalol), full fleet metrics, tender feeds from 2merkato.com and EGP, and double-booking GiST protections.

LANGUAGE & VOICE RULES:
- Detect the user's language.
- If the user speaks or writes in Amharic, YOU MUST RESPOND FLUENTLY IN AMHARIC (አማርኛ).
- If the user speaks or writes in English, YOU MUST RESPOND IN ENGLISH.
- Keep responses concise, authoritative, and formatted cleanly with bullet points and bold headers.

CURRENT ERP REAL-TIME DATA SNAPSHOT:
- Passenger Cars: ${INITIAL_ASSETS.filter((a) => a.category === 'passenger_car').length} units (Toyota Corolla Cross Hybrid @ 6,000-8,500 ETB/day)
- 4x4 SUVs & Site Pickups: ${INITIAL_ASSETS.filter((a) => a.category === 'suv_4x4' || a.category === 'commercial_van').length} units (Hilux GD-6, Fortuner, Land Cruiser @ 11,500-18,000 ETB/day)
- Heavy Machinery: ${INITIAL_ASSETS.filter((a) => a.category === 'heavy_machinery').length} units (CAT 320D, Komatsu D65, SANY Graders, Sinotruk @ 35,000-55,000 ETB/day, 8 engine hours included)
- Certified Operators & Drivers: ${INITIAL_OPERATORS.length} certified personnel across Ethiopia
- Active Tenders (2merkato & EGP): ${INITIAL_TENDERS.length} open tenders (ERA Heavy Equipment @ 96% match, Ethio Telecom 4WD Towers @ 94% match, CBE Executive Hybrid @ 92% match).
- Company Currency: Ethiopian Birr (ETB).
`;
}

/**
 * Queries Gemini API with fallback to local RAG engine
 */
export async function queryGeminiOrRag(
  userQuery: string,
  role: UserRole,
  forcedLanguage?: 'en' | 'am'
): Promise<{
  text: string;
  language: 'en' | 'am';
  isGeminiPowered: boolean;
  roleScopedDivision: 'elshaday' | 'liora' | 'dalol' | 'all';
  isRestricted: boolean;
}> {
  const detectedLang: 'en' | 'am' = forcedLanguage || (isAmharicText(userQuery) ? 'am' : 'en');

  // If Gemini API is configured and client initialized, use Gemini
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: buildSystemPrompt(role, detectedLang),
      });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: userQuery }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      });

      const responseText = result.response.text();
      const isRestricted =
        responseText.includes("Role-Based Access") ||
        responseText.includes("የፈቃድ ገደብ") ||
        responseText.includes("restricted") ||
        responseText.includes("የተከለከለ");

      return {
        text: responseText,
        language: detectedLang,
        isGeminiPowered: true,
        roleScopedDivision:
          role === "elshaday_admin"
            ? "elshaday"
            : role === "liora_admin"
            ? "liora"
            : role === "dalol_admin"
            ? "dalol"
            : "all",
        isRestricted,
      };
    } catch (apiErr) {
      console.warn("Gemini API call encountered error, falling back to local RAG:", apiErr);
    }
  }

  // Graceful local RAG Engine fallback
  const ragResult = processDelsBotQuery({
    message: userQuery,
    role,
    language: detectedLang,
  });

  const responseText = detectedLang === 'am' ? ragResult.answerAm : ragResult.answerEn;

  return {
    text: responseText,
    language: detectedLang,
    isGeminiPowered: false,
    roleScopedDivision: ragResult.roleScopedDivision,
    isRestricted: ragResult.isRestricted,
  };
}
