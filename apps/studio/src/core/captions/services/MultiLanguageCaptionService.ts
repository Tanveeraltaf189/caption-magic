export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isHinglish: boolean;
  isRomanUrdu: boolean;
}

export interface TranscriptionOptions {
  apiProvider: 'groq' | 'gemini' | 'offline';
  language: string;
  audioFile: File;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
}

export class MultiLanguageCaptionService {
  private groqApiKey: string | undefined;
  private geminiApiKey: string | undefined;

  constructor(groqKey?: string, geminiKey?: string) {
    this.groqApiKey = groqKey;
    this.geminiApiKey = geminiKey;
  }

  detectLanguage(text: string): LanguageDetectionResult {
    const hinglishPattern = /[a-zA-Z]*[ा-ॿ]+[a-zA-Z]*/g;
    const romanUrduPattern = /[a-zA-Z]*[ء-ي]+[a-zA-Z]*/g;
    const hinglishMatches = text.match(hinglishPattern) || [];
    const romanUrduMatches = text.match(romanUrduPattern) || [];

    if (hinglishMatches.length > romanUrduMatches.length) {
      return {
        language: 'hinglish',
        confidence: hinglishMatches.length / (text.split(' ').length || 1),
        isHinglish: true,
        isRomanUrdu: false,
      };
    }

    if (romanUrduMatches.length > 0) {
      return {
        language: 'roman-urdu',
        confidence: romanUrduMatches.length / (text.split(' ').length || 1),
        isHinglish: false,
        isRomanUrdu: true,
      };
    }

    return {
      language: 'en',
      confidence: 0.9,
      isHinglish: false,
      isRomanUrdu: false,
    };
  }

  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
    if (options.apiProvider === 'groq' && this.groqApiKey) {
      return this.transcribeWithGroq(options.audioFile, options.language);
    }
    if (options.apiProvider === 'gemini' && this.geminiApiKey) {
      return this.transcribeWithGemini(options.audioFile, options.language);
    }
    return { text: 'Offline mode', language: options.language, confidence: 0 };
  }

  private async transcribeWithGroq(audioFile: File, language: string): Promise<TranscriptionResult> {
    if (!this.groqApiKey) throw new Error('Groq key not set');
    return { text: 'Groq transcription', language, confidence: 0.95 };
  }

  private async transcribeWithGemini(audioFile: File, language: string): Promise<TranscriptionResult> {
    if (!this.geminiApiKey) throw new Error('Gemini key not set');
    return { text: 'Gemini transcription', language, confidence: 0.92 };
  }
}
