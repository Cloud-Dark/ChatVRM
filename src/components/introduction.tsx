import { useState, useCallback, useEffect } from "react";
import { Link } from "./link";
import { SpeechSynthesisParam, DEFAULT_SPEECH_SYNTHESIS_PARAM } from "@/features/constants/speechSynthesisParam";

type VoiceProvider = "elevenlabs" | "speechSynthesis";

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  voiceProvider: VoiceProvider;
  elevenLabsParam: { voiceId: string };
  speechSynthesisParam: SpeechSynthesisParam;
  onChangeAiKey: (openAiKey: string) => void;
  onChangeElevenLabsKey: (elevenLabsKey: string) => void;
  onChangeVoiceProvider: (provider: VoiceProvider) => void;
  onChangeElevenLabsVoice: (voiceId: string) => void;
  onChangeSpeechSynthesisParam: (param: SpeechSynthesisParam) => void;
};

export const Introduction = ({ 
  openAiKey, 
  elevenLabsKey, 
  voiceProvider,
  elevenLabsParam,
  speechSynthesisParam,
  onChangeAiKey, 
  onChangeElevenLabsKey,
  onChangeVoiceProvider,
  onChangeElevenLabsVoice,
  onChangeSpeechSynthesisParam
}: Props) => {
  const [opened, setOpened] = useState(true);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey]
  );

  const handleElevenLabsKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeElevenLabsKey(event.target.value);
    },
    [onChangeElevenLabsKey]
  );

  const handleVoiceProviderChange = (provider: VoiceProvider) => {
    onChangeVoiceProvider(provider);
    localStorage.setItem('voiceProvider', provider);
  };

  // Load ElevenLabs voices when API key is provided
  useEffect(() => {
    if (elevenLabsKey) {
      fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': elevenLabsKey
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.voices) {
            setElevenLabsVoices(data.voices);
          }
        })
        .catch(err => console.error('Failed to load ElevenLabs voices:', err));
    }
  }, [elevenLabsKey]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoices(voices);
    };
    
    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40  bg-black/30 font-M_PLUS_2">
      <div className="mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            About ChatVRM
          </div>
          <div>
            You can enjoy conversations with 3D characters using only a web browser using a microphone, text input, and speech synthesis. You can also change the character (VRM), set the personality, and adjust the voice.
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Technology
          </div>
          <div>
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />&nbsp;
            is used for displaying and manipulating 3D models,
            &nbsp;<Link
              url={
                "https://openrouter.ai/"
              }
              label={"OpenRouter"}
            />&nbsp;
            is used for LLM access, and
            &nbsp;<Link url={"https://beta.elevenlabs.io/"} label={"ElevenLabs"} />&nbsp;
            is used for text to speech (alternatively, you can use browser speech synthesis).
          </div>
          <div className="my-16">
            The source code for this demo is available on GitHub. Feel free to experiment with changes and modifications!
            <br />
            Repository:
            &nbsp;<Link
              url={"https://github.com/Cloud-Dark/ChatVRM"}
              label={"https://github.com/Cloud-Dark/ChatVRM"}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Precautions for use
          </div>
          <div>
            Do not intentionally induce discriminatory or violent remarks, or remarks that demean a specific person. Also, when replacing characters using a VRM model, please follow the model&apos;s terms of use.
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Voice Provider
          </div>
          <div className="my-16">
            Choose your preferred text-to-speech provider:
          </div>
          <div className="my-8 flex flex-col gap-8">
            <label className="flex items-center gap-8 cursor-pointer p-8 rounded-8 border-2 border-solid border-gray-300 hover:border-secondary">
              <input
                type="radio"
                name="voiceProvider"
                value="elevenlabs"
                checked={voiceProvider === "elevenlabs"}
                onChange={() => handleVoiceProviderChange("elevenlabs")}
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
                onChange={() => handleVoiceProviderChange("speechSynthesis")}
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
          <div className="my-24">
            <div className="my-8 font-bold typography-20 text-secondary">
              ElevenLabs API Key
            </div>
            <input
              type="text"
              placeholder="ElevenLabs API key"
              value={elevenLabsKey}
              onChange={handleElevenLabsKeyChange}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
            ></input>
            <div className="my-16">
              Enter your ElevenLabs API key to enable text to speech. You can get an API key at the&nbsp;
              <Link
                url="https://beta.elevenlabs.io/"
                label="ElevenLabs website"
              />.
            </div>
            
            {elevenLabsKey && elevenLabsVoices.length > 0 && (
              <div className="my-16">
                <div className="my-8 font-bold typography-16">Select Voice</div>
                <select
                  className="h-40 px-8 w-full bg-surface3 rounded-4"
                  value={elevenLabsParam.voiceId}
                  onChange={(e) => onChangeElevenLabsVoice(e.target.value)}
                >
                  {elevenLabsVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {voiceProvider === "speechSynthesis" && (
          <div className="my-24">
            <div className="my-8 font-bold typography-20 text-secondary">
              Browser Speech Synthesis
            </div>
            <div className="my-8 p-16 bg-surface1 rounded-8">
              ✓ No API key required<br/>
              ✓ Uses your browser&apos;s built-in speech synthesis<br/>
              ✓ Works offline (after initial page load)<br/>
              ✓ Voice quality depends on your operating system
            </div>
            
            {browserVoices.length > 0 && (
              <div className="my-16">
                <div className="my-8 font-bold typography-16">Select Voice</div>
                <select
                  className="h-40 px-8 w-full bg-surface3 rounded-4"
                  value={speechSynthesisParam.voiceName}
                  onChange={(e) => {
                    const newParam = {
                      ...speechSynthesisParam,
                      voiceName: e.target.value
                    };
                    onChangeSpeechSynthesisParam(newParam);
                  }}
                >
                  <option value="">Select a voice...</option>
                  {browserVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="my-16">
              <div className="my-8 font-bold typography-16">Pitch: {speechSynthesisParam.pitch.toFixed(1)}</div>
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
                }}
                className="w-full"
              />
            </div>
            
            <div className="my-16">
              <div className="my-8 font-bold typography-16">Speed: {speechSynthesisParam.rate.toFixed(1)}x</div>
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
                }}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
