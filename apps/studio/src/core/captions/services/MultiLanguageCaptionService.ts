export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isHinglish: boolean;
  isRomanUrdu: boolean;
}

export interface TranscriptionOptions {
  apiProvider: 'groq' | 'gemini' | 'offline';
  language: 'en' | 'hi' | 'ur' | 'hinglish' | 'roman-urdu';
  audioFile: File;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  timestamps?: Array<{ time: number; text: string }>;
}

export class MultiLanguageCaptionService {
  private groqApiKey: string | undefined;
  private geminiApiKey: string | undefined;

  constructor(groqKey?: string, geminiKey?: string) {
    this.groqApiKey = groqKey;
    this.geminiApiKey = geminiKey;
  }

  // Auto-detect language from text
  detectLanguage(text: string): LanguageDetectionResult {
    const hinglishPattern = /[a-zA-Z]*[ा-ॿ]+[a-zA-Z]*/g;
    const romanUrduPattern = /[a-zA-Z]*[ء-ي]+[a-zA-Z]*/g;
    const hinglishMatches = text.match(hinglishPattern) || [];
    const romanUrduMatches = text.match(romanUrduPattern) || [];

    if (hinglishMatches.length > romanUrduMatches.length) {
      return {
        language: 'hinglish',
        confidence: hinglishMatches.length / text.split(' ').length,
        isHinglish: true,
        isRomanUrdu: false,
      };
    }

    if (romanUrduMatches.length > 0) {
      return {
        language: 'roman-urdu',
        confidence: romanUrduMatches.length / text.split(' ').length,
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

  // Transcribe using Groq API
  async transcribeWithGroq(
    audioFile: File,
    language: string
  ): Promise<TranscriptionResult> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', language);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
        },
        body: formData,
      });

      const data = await response.json();
      return {
        text: data.text,
        language,
        confidence: 0.95,
        timestamps: data.segments?.map((s: any) => ({
          time: s.start,
          text: s.text,
        })),
      };
    } catch (error) {
      throw new Error(`Groq transcription failed: ${error}`);
    }
  }

  // Transcribe using Gemini API
  async transcribeWithGemini(
    audioFile: File,
    language: string
  ): Promise<TranscriptionResult> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/upload/files?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadData = await response.json();
      const fileUri = uploadData.file.uri;

      const transcriptResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    file_data: { mime_type: 'audio/wav', file_uri: fileUri },
                  },
                  {
                    text: `Transcribe this audio in ${language} language. Return only the transcribed text.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const transcriptData = await transcriptResponse.json();
      const text =
        transcriptData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text,
        language,
        confidence: 0.92,
      };
    } catch (error) {
      throw new Error(`Gemini transcription failed: ${error}`);
    }
  }

  // Offline transcription using local Whisper model
  async transcribeOffline(
    audioFile: File,
    language: string
  ): Promise<TranscriptionResult> {
    // This would require integrating a library like whisper.cpp or similar
    // Placeholder for offline implementation
    return {
      text: 'Offline transcription not yet implemented',
      language,
      confidence: 0,
    };
  }

  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
    switch (options.apiProvider) {
      case 'groq':
        return this.transcribeWithGroq(options.audioFile, options.language);
      case 'gemini':
        return this.transcribeWithGemini(options.audioFile, options.language);
      case 'offline':
        return this.transcribeOffline(options.audioFile, options.language);
      default:
        throw new Error('Unknown API provider');
    }
  }
}
