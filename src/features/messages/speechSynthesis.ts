import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { SpeechSynthesisParam } from "../constants/speechSynthesisParam";

export const speakWithSpeechSynthesis = (
  screenplay: Screenplay,
  viewer: Viewer,
  speechSynthesisParam: SpeechSynthesisParam,
  onStart?: () => void,
  onComplete?: () => void
) => {
  const message = screenplay.talk.message;

  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  console.log('[SpeechSynthesis] Available voices count:', voices.length);
  console.log('[SpeechSynthesis] Selected voice name:', speechSynthesisParam.voiceName);

  const utterance = new SpeechSynthesisUtterance(message);

  // Select the specified voice by name
  if (speechSynthesisParam.voiceName) {
    // Try exact match first
    let selectedVoice = voices.find(v => v.name === speechSynthesisParam.voiceName);
    
    // If not found, try partial match
    if (!selectedVoice) {
      selectedVoice = voices.find(v => speechSynthesisParam.voiceName.includes(v.name) || v.name.includes(speechSynthesisParam.voiceName));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('[SpeechSynthesis] Voice set:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn('[SpeechSynthesis] Voice not found:', speechSynthesisParam.voiceName);
      console.log('[SpeechSynthesis] Available voice names:', voices.map(v => v.name));
    }
  }

  // Fallback: prefer Japanese voice for Nanami, then English
  if (!utterance.voice) {
    const japaneseVoice = voices.find(v => v.lang.startsWith('ja-JP'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
      console.log('[SpeechSynthesis] Using Japanese voice:', japaneseVoice.name);
    } else {
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('[SpeechSynthesis] Using English voice:', englishVoice.name);
      }
    }
  }

  // Apply pitch and rate from params
  utterance.pitch = Math.max(0.5, Math.min(2, speechSynthesisParam.pitch));
  utterance.rate = Math.max(0.5, Math.min(2, speechSynthesisParam.rate));
  
  console.log('[SpeechSynthesis] Final voice:', utterance.voice?.name || 'default');
  console.log('[SpeechSynthesis] Pitch:', utterance.pitch, 'Rate:', utterance.rate);

  // Don't cancel previous speech - let it finish naturally
  // This prevents "interrupted" errors
  
  utterance.onstart = () => {
    console.log('[SpeechSynthesis] Started speaking');
    onStart?.();
    viewer.model?.speak(null, screenplay);
  };

  utterance.onend = () => {
    console.log('[SpeechSynthesis] Finished speaking');
    onComplete?.();
  };

  utterance.onerror = (event) => {
    if (event.error === 'interrupted') {
      console.log('[SpeechSynthesis] Speech was interrupted (expected when new speech starts)');
    } else {
      console.error('[SpeechSynthesis] Error:', event.error);
    }
    onComplete?.();
  };

  // Speak the utterance
  window.speechSynthesis.speak(utterance);
};
