import React, { useEffect, useState, cache } from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import {
  KoeiroParam,
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from "@/features/constants/koeiroParam";
import { Link } from "./link";
import { getVoices } from "@/features/elevenlabs/elevenlabs";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { RestreamTokens } from "./restreamTokens";
import Cookies from 'js-cookie';
import VrmPresets from "@/features/vrmViewer/vrmPresets";
import { SpeechSynthesisParam } from "@/features/constants/speechSynthesisParam";

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  voiceProvider: "elevenlabs" | "speechSynthesis";
  speechSynthesisParam: SpeechSynthesisParam;
  onClickClose: () => void;
  onChangeAiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onRestreamTokensUpdate?: (tokens: { access_token: string; refresh_token: string; } | null) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
  onChangeVoiceProvider: (provider: "elevenlabs" | "speechSynthesis") => void;
  onChangeSpeechSynthesisParam: (param: SpeechSynthesisParam) => void;
};
export const Settings = ({
  openAiKey,
  elevenLabsKey,
  openRouterKey,
  chatLog,
  systemPrompt,
  elevenLabsParam,
  koeiroParam,
  voiceProvider,
  speechSynthesisParam,
  onClickClose,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeOpenRouterKey,
  onChangeElevenLabsKey,
  onChangeElevenLabsVoice,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  backgroundImage,
  onChangeBackgroundImage,
  onRestreamTokensUpdate = () => {},
  onTokensUpdate,
  onChatMessage,
  onChangeVoiceProvider,
  onChangeSpeechSynthesisParam,
}: Props) => {

  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Check if ElevenLabs API key exists before fetching voices
    if (elevenLabsKey) {
      getVoices(elevenLabsKey).then((data) => {
        console.log('getVoices');
        console.log(data);

        const voices = data.voices;
        setElevenLabsVoices(voices);
      });
    }
  }, [elevenLabsKey]);

  useEffect(() => {
    // Load browser speech synthesis voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoices(voices);
    };
    
    loadVoices();
    
    // Voices are loaded asynchronously in some browsers
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
        localStorage.setItem('backgroundImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onChangeBackgroundImage('');
    localStorage.removeItem('backgroundImage');
  };

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
          <div className="my-24 typography-32 font-bold">Settings</div>
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">OpenRouter API</div>
            <input
              type="text"
              placeholder="OpenRouter API key"
              value={openRouterKey}
              onChange={onChangeOpenRouterKey}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
            ></input>
            <div>
              Enter your OpenRouter API key for custom access. You can get an API key at the&nbsp;
              <Link
                url="https://openrouter.ai/"
                label="OpenRouter website"
              />. By default, this app uses its own OpenRouter API key for people to try things out easily, but that may run of credits and need to be refilled.
            </div>
          </div>
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">Eleven Labs API</div>
            <input
              type="text"
              placeholder="ElevenLabs API key"
              value={elevenLabsKey}
              onChange={onChangeElevenLabsKey}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
            ></input>
            <div>
              Enter your ElevenLabs API key to enable text to speech. You can get an API key at the&nbsp;
              <Link
                url="https://beta.elevenlabs.io/"
                label="ElevenLabs website"
              />.
            </div>
          </div>
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              Voice Provider
            </div>
            <div className="my-8 flex flex-col gap-4">
              <label className="flex items-center gap-8 cursor-pointer p-8 rounded-8 border-2 border-solid border-gray-300 hover:border-secondary">
                <input
                  type="radio"
                  name="voiceProvider"
                  value="elevenlabs"
                  checked={voiceProvider === "elevenlabs"}
                  onChange={(e) => {
                    onChangeVoiceProvider(e.target.value as "elevenlabs" | "speechSynthesis");
                    localStorage.setItem('voiceProvider', e.target.value);
                  }}
                  className="w-16 h-16"
                />
                <div>
                  <span className="font-bold">ElevenLabs</span>
                  <div className="text-sm text-gray-600">
                    High-quality AI voices (requires API key)
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-8 cursor-pointer p-8 rounded-8 border-2 border-solid border-gray-300 hover:border-secondary">
                <input
                  type="radio"
                  name="voiceProvider"
                  value="speechSynthesis"
                  checked={voiceProvider === "speechSynthesis"}
                  onChange={(e) => {
                    onChangeVoiceProvider(e.target.value as "elevenlabs" | "speechSynthesis");
                    localStorage.setItem('voiceProvider', e.target.value);
                  }}
                  className="w-16 h-16"
                />
                <div>
                  <span className="font-bold">Browser Speech Synthesis</span>
                  <div className="text-sm text-gray-600">
                    Built-in browser voices (no API key needed)
                  </div>
                </div>
              </label>
            </div>
          </div>
          {voiceProvider === "elevenlabs" && (
            <div className="my-40">
              <div className="my-16 typography-20 font-bold">
                ElevenLabs Voice Selection
              </div>
              <div className="my-8">
                <select 
                  className="h-40 px-8 w-full"
                  value={elevenLabsParam.voiceId}
                  onChange={onChangeElevenLabsVoice}
                >
                  {elevenLabsVoices.length > 0 ? (
                    elevenLabsVoices.map((voice, index) => (
                      <option key={index} value={voice.voice_id}>
                        {voice.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No voices loaded. Please enter your API key.</option>
                  )}
                </select>
              </div>
            </div>
          )}
          {voiceProvider === "speechSynthesis" && (
            <div className="my-40">
              <div className="my-16 typography-20 font-bold">
                Browser Voice Selection
              </div>
              <div className="my-8">
                <select 
                  className="h-40 px-8 w-full"
                  value={speechSynthesisParam.voiceName}
                  onChange={(e) => {
                    const newParam = {
                      ...speechSynthesisParam,
                      voiceName: e.target.value
                    };
                    onChangeSpeechSynthesisParam(newParam);
                    localStorage.setItem('speechSynthesisParam', JSON.stringify(newParam));
                  }}
                >
                  <option value="">Select a voice...</option>
                  {browserVoices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div className="my-16 flex flex-col gap-4">
                <div>
                  <label className="font-bold">Pitch: {speechSynthesisParam.pitch.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechSynthesisParam.pitch}
                    onChange={(e) => {
                      const newParam = {
                        ...speechSynthesisParam,
                        pitch: parseFloat(e.target.value)
                      };
                      onChangeSpeechSynthesisParam(newParam);
                      localStorage.setItem('speechSynthesisParam', JSON.stringify(newParam));
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="font-bold">Speed: {speechSynthesisParam.rate.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechSynthesisParam.rate}
                    onChange={(e) => {
                      const newParam = {
                        ...speechSynthesisParam,
                        rate: parseFloat(e.target.value)
                      };
                      onChangeSpeechSynthesisParam(newParam);
                      localStorage.setItem('speechSynthesisParam', JSON.stringify(newParam));
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              Character Model
            </div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>Open VRM</TextButton>
            </div>
            <div className="my-16 typography-16 font-bold">
              Or choose from presets:
            </div>
            <VrmPresets />
          </div>
          <div className="my-40">
            <div className="my-8">
              <div className="my-16 typography-20 font-bold">
                Character Settings (System Prompt)
              </div>
              <TextButton onClick={onClickResetSystemPrompt}>
                Reset character settings
              </TextButton>
            </div>

            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="px-16 py-8  bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full"
            ></textarea>
          </div>
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              Background Image
            </div>
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
                    <TextButton onClick={handleRemoveBackground}>
                      Remove Background
                    </TextButton>
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-600">
                The background image will be saved in your browser and restored when you return.
              </div>
            </div>
          </div>
          <RestreamTokens onTokensUpdate={onTokensUpdate} onChatMessage={onChatMessage} />
          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">Conversation History</div>
                <TextButton onClick={onClickResetChatLog}>
                  Reset conversation history
                </TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                    >
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}
                      ></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
