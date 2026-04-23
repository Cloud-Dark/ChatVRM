export type SpeechSynthesisParam = {
    voiceName: string;
    pitch: number;
    rate: number;
};

export const DEFAULT_SPEECH_SYNTHESIS_PARAM: SpeechSynthesisParam = {
    voiceName: "",
    pitch: 1,
    rate: 1,
};
