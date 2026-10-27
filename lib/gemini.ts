import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, INITIAL_ASSETS, INITIAL_OPERATORS, INITIAL_BOOKINGS } from "./db";
import { INITIAL_TENDERS } from "./tenders-data";
import { UserRole } from "./types";
import { processDelsBotQuery, isAmharicText } from "./dels-bot-engine";

export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  ).trim();
}

export const isGeminiConfigured = Boolean(getGeminiApiKey().length > 0);

function getGenAI(): GoogleGenerativeAI | null {
  const key = getGeminiApiKey();
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch (err) {
    console.warn("GoogleGenerativeAI init error:", err);
    return null;
  }
}

/**
 * Builds the comprehensive role-scoped system context for Gemini using LIVE platform metrics
 */
function buildSystemPrompt(role: UserRole, detectedLanguage: 'en' | 'am'): string {
  const assets = db.assets && db.assets.length > 0 ? db.assets : INITIAL_ASSETS;
  const operators = db.getOperators ? db.getOperators() : INITIAL_OPERATORS;
  const bookings = db.bookings && db.bookings.length > 0 ? db.bookings : INITIAL_BOOKINGS;

  const passengerCars = assets.filter((a) => a.category === 'passenger_car');
  const suvs4x4 = assets.filter((a) => a.category === 'suv_4x4' || a.category === 'commercial_van');
  const heavyMachinery = assets.filter((a) => a.category === 'heavy_machinery');
  const activeDispatches = bookings.filter((b) => b.status === 'dispatched' || b.status === 'confirmed');

  return `You are "Del's Bot", an elite, bilingual AI ERP intelligence assistant for DEL Services (Enterprise Vehicle Fleet & Heavy Construction Machinery Rental platform in Ethiopia).
Headquarters: Jarkros Sets Building, 2nd Floor, Addis Ababa, Ethiopia.
Email: info@delservices.et | Phone: +251 964 727 269 / +251 911 526 965.

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

DYNAMIC RESPONSE MANDATE:
- Do NOT provide generic canned or hardcoded responses.
- Dynamically synthesize every response directly answering the user's exact query using the live fleet statistics and parameters below.
- If the user speaks or writes in Amharic, YOU MUST RESPOND FLUENTLY IN AMHARIC (አማርኛ).
- If the user speaks or writes in English, YOU MUST RESPOND IN ENGLISH.
- Keep responses concise, authoritative, structured with bullet points and bold highlights.

CURRENT ERP REAL-TIME DATA SNAPSHOT:
- Total Fleet: ${assets.length} registered units
- Passenger Cars: ${passengerCars.length} units (Toyota Corolla Cross Hybrid @ 6,000-8,500 ETB/day)
- 4x4 SUVs & Site Pickups: ${suvs4x4.length} units (Hilux GD-6, Fortuner, Land Cruiser @ 11,500-18,000 ETB/day)
- Heavy Machinery: ${heavyMachinery.length} units (CAT 320D, Komatsu D65, SANY Graders, Sinotruk @ 35,000-55,000 ETB/day, 8 engine hours included)
- Certified Operators & Drivers: ${operators.length} certified personnel across Ethiopia
- Active Dispatches on Corridor: ${activeDispatches.length} missions active
- Active Tenders (2merkato & EGP): ${INITIAL_TENDERS.length} open tenders (ERA Heavy Equipment @ 96% match, Ethio Telecom 4WD Towers @ 94% match, CBE Executive Hybrid @ 92% match).
- Official Currency: Ethiopian Birr (ETB).
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

  const ai = getGenAI();
  // If Gemini API is configured and client initialized, use Gemini
  if (ai) {
    try {
      const model = ai.getGenerativeModel({
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
