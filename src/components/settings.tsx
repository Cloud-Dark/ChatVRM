import React, { useEffect, useState } from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { Link } from "./link";
import { getVoices } from "@/features/elevenlabs/elevenlabs";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { RestreamTokens } from "./restreamTokens";
import VrmPresets from "@/features/vrmViewer/vrmPresets";
import { SpeechSynthesisParam } from "@/features/constants/speechSynthesisParam";
import {
  AIProvider,
  DEFAULT_APIPEDIA_MODEL,
  DEFAULT_OPENROUTER_MODEL,
} from "@/features/chat/providers";

type Props = {
  aiProvider: AIProvider;
  llmApiKey: string;
  llmModel: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  voiceProvider: "elevenlabs" | "speechSynthesis";
  speechSynthesisParam: SpeechSynthesisParam;
  onClickClose: () => void;
  onChangeAiProvider: (provider: AIProvider) => void;
  onChangeLlmApiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeLlmModel: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (image: string) => void;
  onRestreamTokensUpdate?: (tokens: { access_token: string; refresh_token: string } | null) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
  onChangeVoiceProvider: (provider: "elevenlabs" | "speechSynthesis") => void;
  onChangeSpeechSynthesisParam: (param: SpeechSynthesisParam) => void;
};

export const Settings = ({
  aiProvider,
  llmApiKey,
  llmModel,
  elevenLabsKey,
  chatLog,
  systemPrompt,
  elevenLabsParam,
  voiceProvider,
  speechSynthesisParam,
  onClickClose,
  onChangeAiProvider,
  onChangeLlmApiKey,
  onChangeLlmModel,
  onChangeElevenLabsKey,
  onChangeElevenLabsVoice,
  onChangeSystemPrompt,
  onChangeChatLog,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  backgroundImage,
  onChangeBackgroundImage,
  onTokensUpdate,
  onChatMessage,
  onChangeVoiceProvider,
  onChangeSpeechSynthesisParam,
}: Props) => {
  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (elevenLabsKey) {
      getVoices(elevenLabsKey)
        .then((data) => {
          if (data.voices) setElevenLabsVoices(data.voices);
        })
        .catch((error) => {
          console.error("Failed to load ElevenLabs voices:", error);
          setElevenLabsVoices([]);
        });
    } else {
        setElevenLabsVoices([]);
    }
  }, [elevenLabsKey]);

  useEffect(() => {
    const loadVoices = () => {
      setBrowserVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChangeBackgroundImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onChangeBackgroundImage("");
  };

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64">
          <div className="my-24 typography-32 font-bold">Settings</div>
          
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">AI Provider</div>
            <div className="my-8 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={aiProvider === "openrouter"}
                  onChange={() => onChangeAiProvider("openrouter")}
                />
                <span>OpenRouter</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer ml-16">
                <input 
                  type="radio" 
                  checked={aiProvider === "apipedia"}
                  onChange={() => onChangeAiProvider("apipedia")}
                />
                <span>APIPedia</span>
              </label>
            </div>
            
            <div className="my-16">
              <div className="font-bold mb-4">LLM API Key</div>
              <input
                type="text"
                placeholder={aiProvider === "apipedia" ? "APIPedia API key" : "OpenRouter API key"}
                value={llmApiKey}
                onChange={onChangeLlmApiKey}
                className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
              />
            </div>

            <div className="my-16">
              <div className="font-bold mb-4">LLM Model</div>
              <input
                type="text"
                placeholder={aiProvider === "apipedia" ? DEFAULT_APIPEDIA_MODEL : DEFAULT_OPENROUTER_MODEL}
                value={llmModel}
                onChange={onChangeLlmModel}
                className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis font-mono"
              />
            </div>
          </div>

          <div className="my-40">
            <div className="my-16 typography-20 font-bold">Voice Provider</div>
            <div className="my-8 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={voiceProvider === "elevenlabs"}
                  onChange={() => onChangeVoiceProvider("elevenlabs")}
                />
                <span>ElevenLabs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer ml-16">
                <input 
                  type="radio" 
                  checked={voiceProvider === "speechSynthesis"}
                  onChange={() => onChangeVoiceProvider("speechSynthesis")}
                />
                <span>Browser Speech Synthesis</span>
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
                     onChange={onChangeElevenLabsKey}
                     className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
                   />
                </div>
                <div className="my-16">
                   <div className="font-bold mb-4">Voice</div>
                   <select 
                     className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
                     value={elevenLabsParam.voiceId}
                     onChange={onChangeElevenLabsVoice}
                   >
                     <option value="">Pilih voice...</option>
                     {elevenLabsVoices.map((v) => (
                       <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                     ))}
                   </select>
                </div>
              </>
            ) : (
              <>
                <div className="my-16">
                   <div className="font-bold mb-4">Browser Voice</div>
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

          <div className="my-40">
            <div className="my-16 typography-20 font-bold">Character Model</div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>Open VRM</TextButton>
            </div>
            <div className="my-8">
               <VrmPresets />
            </div>
          </div>

          <div className="my-40">
            <div className="my-8">
              <div className="my-16 typography-20 font-bold">Character Settings (System Prompt)</div>
              <TextButton onClick={onClickResetSystemPrompt}>Reset character settings</TextButton>
            </div>
            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="px-16 py-8 bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full font-mono text-sm"
            ></textarea>
          </div>

          <div className="my-40">
            <div className="my-16 typography-20 font-bold">Background Image</div>
            <div className="my-16">Choose a custom background image:</div>
            <div className="my-8 flex flex-col gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="my-4"
              />
              {backgroundImage && (
                <div className="flex flex-col gap-4">
                  <div className="my-8">
                    <img
                      src={backgroundImage}
                      alt="Background Preview"
                      className="max-w-[200px] rounded-4"
                    />
                  </div>
                  <div className="my-8">
                    <TextButton onClick={handleRemoveBackground}>Remove Background</TextButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          <RestreamTokens onTokensUpdate={onTokensUpdate} onChatMessage={onChatMessage} />

          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">Conversation History</div>
                <TextButton onClick={onClickResetChatLog}>Reset conversation history</TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => (
                  <div
                    key={index}
                    className="my-8 grid grid-flow-col grid-cols-[min-content_1fr] gap-x-fixed"
                  >
                    <div className="w-[64px] py-8 font-bold text-gray-500 text-sm">
                      {value.role === "assistant" ? "Character" : "You"}
                    </div>
                    <input
                      className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                      type="text"
                      value={value.content}
                      onChange={(event) => onChangeChatLog(index, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
