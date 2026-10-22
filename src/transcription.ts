/**
 * Phase 2 stubs for audio transcription.
 *
 * Currently always a no-op. Wire the AI model here once transcription is ready:
 *   - Call the chosen transcription service with the decrypted audio URL
 *   - Return the transcribed text
 *   - The caller (inbound.ts) prepends it to the message text
 *
 * @param publicUrl - Temporary Wasender-decrypted URL of the audio file (1h TTL)
 * @returns The transcribed text, or null when transcription is disabled or fails
 */
export async function transcribeAudio(_publicUrl: string): Promise<string | null> {
  // Phase 2: replace with actual transcription call.
  // Check env flag first (e.g. env.TRANSCRIPTION_ENABLED === 'true'),
  // then call the AI model endpoint, catch errors gracefully.
  return null;
}