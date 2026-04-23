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

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);

  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  
  // Select the specified voice by name, or fallback to English voice
  if (speechSynthesisParam.voiceName) {
    const selectedVoice = voices.find(v => v.name === speechSynthesisParam.voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }
  
  // If no voice was set by name, try to get an English voice as default
  if (!utterance.voice) {
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  }

  // Apply pitch and rate from params
  utterance.pitch = speechSynthesisParam.pitch;
  utterance.rate = speechSynthesisParam.rate;

  utterance.onstart = () => {
    onStart?.();
    viewer.model?.speak(null, screenplay);
  };

  utterance.onend = () => {
    onComplete?.();
  };

  utterance.onerror = (event) => {
    console.error('SpeechSynthesis error:', event);
    onComplete?.();
  };

  window.speechSynthesis.speak(utterance);
};
