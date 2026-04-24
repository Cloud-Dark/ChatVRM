import { useState, useEffect } from "react";
import { Link } from "./link";
import { SpeechSynthesisParam } from "@/features/constants/speechSynthesisParam";
import {
  AIProvider,
  DEFAULT_APIPEDIA_MODEL,
  DEFAULT_OPENROUTER_MODEL,
} from "@/features/chat/providers";

type VoiceProvider = "elevenlabs" | "speechSynthesis";

type Props = {
  aiProvider: AIProvider;
  llmApiKey: string;
  llmModel: string;
  elevenLabsKey: string;
  voiceProvider: VoiceProvider;
  elevenLabsParam: { voiceId: string };
  speechSynthesisParam: SpeechSynthesisParam;
  onChangeAiProvider: (provider: AIProvider) => void;
  onChangeLlmApiKey: (value: string) => void;
  onChangeLlmModel: (model: string) => void;
  onChangeElevenLabsKey: (elevenLabsKey: string) => void;
  onChangeVoiceProvider: (provider: VoiceProvider) => void;
  onChangeElevenLabsVoice: (voiceId: string) => void;
  onChangeSpeechSynthesisParam: (param: SpeechSynthesisParam) => void;
};

export const Introduction = ({
  aiProvider,
  llmApiKey,
  llmModel,
  elevenLabsKey,
  voiceProvider,
  elevenLabsParam,
  speechSynthesisParam,
  onChangeAiProvider,
  onChangeLlmApiKey,
  onChangeLlmModel,
  onChangeElevenLabsKey,
  onChangeVoiceProvider,
  onChangeElevenLabsVoice,
  onChangeSpeechSynthesisParam,
}: Props) => {
  const [opened, setOpened] = useState(true);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load ElevenLabs voices when key changes
  useEffect(() => {
    if (!elevenLabsKey) {
      setElevenLabsVoices([]);
      return;
    }
    fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": elevenLabsKey },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.voices) setElevenLabsVoices(data.voices);
      })
      .catch((err) => console.error("Failed to load ElevenLabs voices:", err));
  }, [elevenLabsKey]);

  // Load browser voices
  useEffect(() => {
    const load = () => setBrowserVoices(window.speechSynthesis.getVoices());
    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40 bg-black/30 font-M_PLUS_2">
      <div className="mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            About ChatVRM Setup
          </div>
          <div>
            Semua pengaturan di layar ini langsung diterapkan dan otomatis tersimpan. You can adjust the AI Provider, Voice Provider, and other settings below to start the conversation.
          </div>
        </div>
        
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            AI Provider
          </div>
          <div className="my-16">
            Pilih endpoint LLM yang akan dipakai untuk chat.
          </div>
          <div className="my-8 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="ai-provider" 
                value="openrouter"
                checked={aiProvider === "openrouter"}
                onChange={() => onChangeAiProvider("openrouter")}
              />
              <span>OpenRouter (Streaming, choice luas)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-16">
              <input 
                type="radio" 
                name="ai-provider" 
                value="apipedia"
                checked={aiProvider === "apipedia"}
                onChange={() => onChangeAiProvider("apipedia")}
              />
              <span>APIPedia (OpenAPI-compatible)</span>
            </label>
          </div>
          
          <div className="my-16">
            <div className="font-bold mb-4">LLM API Key</div>
            <input
              type="text"
              placeholder={aiProvider === "apipedia" ? "APIPedia API key" : "OpenRouter API key"}
              value={llmApiKey}
              onChange={(e) => onChangeLlmApiKey(e.target.value)}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
            />
          </div>

          <div className="my-16">
            <div className="font-bold mb-4">LLM Model</div>
            <input
              type="text"
              placeholder={aiProvider === "apipedia" ? DEFAULT_APIPEDIA_MODEL : DEFAULT_OPENROUTER_MODEL}
              value={llmModel}
              onChange={(e) => onChangeLlmModel(e.target.value)}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis font-mono"
            />
            <div className="text-sm text-gray-500 mt-2">
              {aiProvider === "apipedia" 
                ? "Contoh: model APIPedia yang Anda aktifkan." 
                : "Contoh: google/gemini-2.5-flash-lite"}
            </div>
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Voice Output
          </div>
          <div className="my-16">
            Pilih apakah karakter berbicara lewat ElevenLabs atau suara browser.
          </div>
          <div className="my-8 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="voice-provider" 
                value="elevenlabs"
                checked={voiceProvider === "elevenlabs"}
                onChange={() => onChangeVoiceProvider("elevenlabs")}
              />
              <span>ElevenLabs (Lebih natural)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-16">
              <input 
                type="radio" 
                name="voice-provider" 
                value="speechSynthesis"
                checked={voiceProvider === "speechSynthesis"}
                onChange={() => onChangeVoiceProvider("speechSynthesis")}
              />
              <span>Browser Speech (Bawaan browser/OS)</span>
            </label>
          </div>

          {voiceProvider === "elevenlabs" ? (
            <>
              <div className="my-16">
                <div className="font-bold mb-4">ElevenLabs API Key</div>
                <input
                  type="text"
                  placeholder="ElevenLabs API key"
                  value={elevenLabsKey}
                  onChange={(e) => onChangeElevenLabsKey(e.target.value)}
                  className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
                />
              </div>
              <div className="my-16">
                <div className="font-bold mb-4">Voice</div>
                <div className="my-4">
                  <select 
                    className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
                    value={elevenLabsParam.voiceId}
                    onChange={(e) => onChangeElevenLabsVoice(e.target.value)}
                  >
                    <option value="">Pilih voice...</option>
                    {elevenLabsVoices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="my-16">
                <div className="font-bold mb-4">Browser Voice</div>
                <div className="my-4">
                  <select 
                    className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
                    value={speechSynthesisParam.voiceName}
                    onChange={(e) => onChangeSpeechSynthesisParam({ ...speechSynthesisParam, voiceName: e.target.value })}
                  >
                    <option value="">Pilih voice browser...</option>
                    {browserVoices.map((v) => (
                      <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="my-16">
                <div className="font-bold mb-4">Pitch ({speechSynthesisParam.pitch.toFixed(1)})</div>
                <input
                  type="range"
                  min="0.5" max="2" step="0.1"
                  value={speechSynthesisParam.pitch}
                  onChange={(e) => onChangeSpeechSynthesisParam({ ...speechSynthesisParam, pitch: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="my-16">
                <div className="font-bold mb-4">Speed ({speechSynthesisParam.rate.toFixed(1)}x)</div>
                <input
                  type="range"
                  min="0.5" max="2" step="0.1"
                  value={speechSynthesisParam.rate}
                  onChange={(e) => onChangeSpeechSynthesisParam({ ...speechSynthesisParam, rate: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Technology
          </div>
          <div>
            <Link url="https://github.com/pixiv/three-vrm" label="@pixiv/three-vrm" />{" "}
            digunakan untuk avatar 3D, OpenRouter atau APIPedia untuk akses LLM, dan{" "}
            <Link url="https://beta.elevenlabs.io/" label="ElevenLabs" /> untuk
            text-to-speech.
          </div>
          <div className="my-16">
            Repository:{" "}
            <Link
              url="https://github.com/Cloud-Dark/ChatVRM"
              label="https://github.com/Cloud-Dark/ChatVRM"
            />
          </div>
        </div>

        <div className="my-24">
          <button
            onClick={() => setOpened(false)}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  ) : null;
};