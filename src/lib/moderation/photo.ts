import "server-only";

// Soft content gate for profile photos, per the Phase 5 safety spec:
// a Gemini Flash-Lite call checks the image is a real photo of a real
// person (not an animal, cartoon, object, or screenshot) and rejects
// anything Gemini's own safety ratings flag MEDIUM or HIGH.
//
// This is NOT identity verification and must never be presented as such —
// it only keeps the browse feed looking like real people.

const PROMPT = `You are reviewing an image uploaded as a profile photo for a
platonic roommate-matching service for adults. Judge only whether it is
suitable as a profile photo:

- suitable: a real photograph that clearly shows at least one real human
  being (face visible). Everyday photos are fine.
- not suitable: animals or pets without a person, cartoons, illustrations,
  avatars, AI-generated-looking portraits, objects, landscapes, memes,
  screenshots, or images of text.

Respond with JSON only, matching exactly:
{"suitable": true|false, "category": "human_photo"|"animal"|"cartoon_or_illustration"|"object_or_scene"|"screenshot_or_text"|"other"}`;

const FRIENDLY_REJECT =
  "That photo won't work as a profile photo — it needs to be a real, everyday photo of you (pets, drawings, and screenshots can live in the chat once you've connected with someone). This is just a photo check, not identity verification.";

const FRIENDLY_UNAVAILABLE =
  "Photo uploads aren't available just now — you can finish your profile and add photos later from Edit profile.";

export interface ModerationVerdict {
  allowed: boolean;
  message: string | null;
}

export async function moderateProfilePhoto(
  imageData: Buffer,
  mimeType: string,
): Promise<ModerationVerdict> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fail closed: no photo becomes public without passing the gate.
    return { allowed: false, message: FRIENDLY_UNAVAILABLE };
  }
  const model = process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest";

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageData.toString("base64"),
                  },
                },
                { text: PROMPT },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0,
          },
        }),
      },
    );
  } catch {
    return { allowed: false, message: FRIENDLY_UNAVAILABLE };
  }

  if (!response.ok) {
    console.error("photo moderation: Gemini returned", response.status);
    return { allowed: false, message: FRIENDLY_UNAVAILABLE };
  }

  const result = await response.json();

  // Blocked at the prompt level by Gemini's safety system.
  if (result.promptFeedback?.blockReason) {
    return { allowed: false, message: FRIENDLY_REJECT };
  }

  const candidate = result.candidates?.[0];

  // Reject anything Gemini's safety categories flag MEDIUM or HIGH.
  const flagged = (candidate?.safetyRatings ?? []).some(
    (r: { probability?: string }) =>
      r.probability === "MEDIUM" || r.probability === "HIGH",
  );
  if (flagged || candidate?.finishReason === "SAFETY") {
    return { allowed: false, message: FRIENDLY_REJECT };
  }

  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    return { allowed: false, message: FRIENDLY_UNAVAILABLE };
  }

  try {
    const verdict = JSON.parse(text);
    if (verdict.suitable === true) {
      return { allowed: true, message: null };
    }
    return { allowed: false, message: FRIENDLY_REJECT };
  } catch {
    return { allowed: false, message: FRIENDLY_UNAVAILABLE };
  }
}
