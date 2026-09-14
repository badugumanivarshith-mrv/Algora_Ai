import { logger } from "../../utils/logger";

export class TextToSpeechService {
  /**
   * Generates playable audio base64 speech stream or browser WebSpeech speech metadata.
   * Languages supported: English, Telugu, Hindi.
   */
  public static async generateSpeech(
    text: string,
    language: string = "English"
  ): Promise<{ audioUrl: string; speechSynthesisText: string; language: string; voiceName: string }> {
    try {
      logger.info(`[TextToSpeechService] Generating speech output for length ${text.length} in ${language}`);

      let voiceName = "Google US English Male";
      if (language.toLowerCase() === "telugu") {
        voiceName = "Google te-IN Female";
      } else if (language.toLowerCase() === "hindi") {
        voiceName = "Google hi-IN Male";
      }

      // Generate clean audio Data URL placeholder for browser playback
      const audioUrl = `data:audio/mp3;base64,SUQ3BAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//5AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;

      return {
        audioUrl,
        speechSynthesisText: text,
        language,
        voiceName,
      };
    } catch (err: any) {
      logger.error(`[TextToSpeechService] Speech synthesis error: ${err.message}`);
      return {
        audioUrl: "",
        speechSynthesisText: text,
        language,
        voiceName: "Default",
      };
    }
  }
}
