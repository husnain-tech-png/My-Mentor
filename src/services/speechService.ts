import { VoiceState } from '../types';

// Speech Recognition declaration for cross-browser support
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isSpeaking = false;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  public isRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  public isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (transcript: string) => void,
    onStateChange: (state: VoiceState) => void
  ): void {
    if (!this.recognition) {
      onStateChange('error');
      return;
    }

    onStateChange('listening');

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onStateChange('processing');
      onResult(transcript);
      setTimeout(() => onStateChange('idle'), 400);
    };

    this.recognition.onerror = () => {
      onStateChange('error');
      setTimeout(() => onStateChange('idle'), 2000);
    };

    this.recognition.onend = () => {
      onStateChange('idle');
    };

    try {
      this.recognition.start();
    } catch {
      onStateChange('error');
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public speak(
    text: string,
    onStateChange?: (state: VoiceState) => void
  ): void {
    if (!this.isSynthesisSupported()) return;

    window.speechSynthesis.cancel();

    // Clean markdown symbols for natural reading
    const cleanText = text
      .replace(/[#*_`>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onStateChange) {
      utterance.onstart = () => {
        this.isSpeaking = true;
        onStateChange('speaking');
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        onStateChange('idle');
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        onStateChange('idle');
      };
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(onStateChange?: (state: VoiceState) => void): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (onStateChange) onStateChange('idle');
    }
  }
}

export const speechService = new SpeechService();
