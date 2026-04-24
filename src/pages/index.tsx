import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_KOEIRO_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
import { ElevenLabsParam, DEFAULT_ELEVEN_LABS_PARAM } from "@/features/constants/elevenLabsParam";
import { buildUrl } from "@/utils/buildUrl";
import { websocketService } from '../services/websocketService';
import { MessageMiddleOut } from "@/features/messages/messageMiddleOut";
import { SpeechSynthesisParam, DEFAULT_SPEECH_SYNTHESIS_PARAM } from "@/features/constants/speechSynthesisParam";
import { AIProvider, DEFAULT_OPENROUTER_MODEL, getDefaultModel } from "@/features/chat/providers";

type VoiceProvider = "elevenlabs" | "speechSynthesis";

const m_plus_2 = M_PLUS_2({
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});

type LLMCallbackResult = {
  processed: boolean;
  error?: string;
};

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [elevenLabsParam, setElevenLabsParam] = useState<ElevenLabsParam>(DEFAULT_ELEVEN_LABS_PARAM);
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_KOEIRO_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [restreamTokens, setRestreamTokens] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  // needed because AI speaking could involve multiple audios being played in sequence
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  // Default to elevenlabs on both server and client to avoid hydration mismatch
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>('elevenlabs');
  const [speechSynthesisParam, setSpeechSynthesisParam] = useState<SpeechSynthesisParam>(DEFAULT_SPEECH_SYNTHESIS_PARAM);
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<AIProvider>('openrouter');
  const [llmApiKey, setLlmApiKey] = useState<string>('');
  const [llmModel, setLlmModel] = useState<string>(DEFAULT_OPENROUTER_MODEL);

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt);
      if (params.elevenLabsParam) {
        setElevenLabsParam(params.elevenLabsParam);
      }
      setChatLog(params.chatLog);
    }
    const savedElevenLabsParam = localStorage.getItem("elevenLabsParam");
    if (savedElevenLabsParam) {
      try {
        setElevenLabsParam(JSON.parse(savedElevenLabsParam));
      } catch (e) {
        console.error("Failed to parse elevenLabsParam from localStorage");
      }
    }
    if (window.localStorage.getItem("elevenLabsKey")) {
      const key = window.localStorage.getItem("elevenLabsKey") as string;
      setElevenLabsKey(key);
    }
    // load openrouter key from localStorage
    const savedOpenRouterKey = localStorage.getItem('openRouterKey');
    if (savedOpenRouterKey) {
      setOpenRouterKey(savedOpenRouterKey);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const apipediaQuery = urlParams.get('apipedia');

    if (apipediaQuery) {
      setAiProvider('apipedia');
      setLlmApiKey(apipediaQuery);
      localStorage.setItem('aiProvider', 'apipedia');
      localStorage.setItem('llmApiKey', apipediaQuery);
      
      // Optionally clean up the URL without a reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      const savedAiProvider = localStorage.getItem('aiProvider');
      if (savedAiProvider === 'openrouter' || savedAiProvider === 'apipedia') {
        setAiProvider(savedAiProvider);
      }
      const savedLlmApiKey = localStorage.getItem('llmApiKey');
      if (savedLlmApiKey) {
        setLlmApiKey(savedLlmApiKey);
      }
    }
    const savedLlmModel = localStorage.getItem('llmModel');
    if (savedLlmModel) {
      setLlmModel(savedLlmModel);
    }
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
    // load voice provider from localStorage
    const savedVoiceProvider = localStorage.getItem('voiceProvider');
    if (savedVoiceProvider) {
      setVoiceProvider(savedVoiceProvider as VoiceProvider);
    }
    // load speech synthesis param from localStorage
    const savedSpeechParam = localStorage.getItem('speechSynthesisParam');
    if (savedSpeechParam) {
      try {
        setSpeechSynthesisParam(JSON.parse(savedSpeechParam));
      } catch (e) {
        console.error('Failed to parse speechSynthesisParam from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "chatVRMParams",
      JSON.stringify({ systemPrompt, elevenLabsParam, chatLog })
    );
  }, [systemPrompt, elevenLabsParam, chatLog]);

  useEffect(() => {
    window.localStorage.setItem("elevenLabsKey", elevenLabsKey);
  }, [elevenLabsKey]);

  useEffect(() => {
    window.localStorage.setItem(
      "elevenLabsParam",
      JSON.stringify(elevenLabsParam)
    );
  }, [elevenLabsParam]);

  useEffect(() => {
    window.localStorage.setItem("voiceProvider", voiceProvider);
  }, [voiceProvider]);

  useEffect(() => {
    window.localStorage.setItem(
      "speechSynthesisParam",
      JSON.stringify(speechSynthesisParam)
    );
  }, [speechSynthesisParam]);

  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      // document.body.style.backgroundSize = 'cover';
      // document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = `url(${buildUrl("/bg-c.png")})`;
    }
  }, [backgroundImage]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直接でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      elevenLabsKey: string,
      elevenLabsParam: ElevenLabsParam,
      voiceProvider: VoiceProvider,
      speechSynthesisParam: SpeechSynthesisParam,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      setIsAISpeaking(true);  // Set speaking state before starting
      try {
        await speakCharacter(
          screenplay,
          elevenLabsKey,
          elevenLabsParam,
          viewer,
          voiceProvider,
          speechSynthesisParam,
          () => {
            setIsPlayingAudio(true);
            console.log('audio playback started');
            onStart?.();
          },
          () => {
            setIsPlayingAudio(false);
            console.log('audio playback completed');
            onEnd?.();
          }
        );
      } catch (error) {
        console.error('Error during AI speech:', error);
      } finally {
        setIsAISpeaking(false);  // Ensure speaking state is reset even if there's an error
      }
    },
    [viewer]
  );

  /**
   * アシスタントとの会話を行う
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      const newMessage = text;
      if (newMessage == null) return;

      setChatProcessing(true);
      // Add user's message to chat log
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // Process messages through MessageMiddleOut
      const messageProcessor = new MessageMiddleOut();
      const processedMessages = messageProcessor.process([
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ]);

      let localApiKey = llmApiKey;
      if (!localApiKey && aiProvider === "openrouter") {
        localApiKey = openRouterKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
      }
      if (!localApiKey && aiProvider === "apipedia") {
        localApiKey = process.env.NEXT_PUBLIC_APIPEDIA_API_KEY || "";
      }

      const stream = await getChatResponseStream(processedMessages, aiProvider, localApiKey, llmModel).catch(
        (e) => {
          console.error(e);
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // console.log('receivedMessage');
          // console.log(receivedMessage);

          // 返答内容のタグ部分の検出
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);

            console.log('tag:');
            console.log(tag);
          }

          // 返答を一単位で切り出して処理する
          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n.!?]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);

            console.log('sentence:');
            console.log(sentence);

            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], elevenLabsKey, elevenLabsParam, voiceProvider, speechSynthesisParam, () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, aiProvider, llmApiKey, llmModel, openAiKey, elevenLabsKey, elevenLabsParam, openRouterKey, voiceProvider, koeiroParam, speechSynthesisParam]
  );

  const handleTokensUpdate = useCallback((tokens: any) => {
    setRestreamTokens(tokens);
  }, []);

  // Set up global websocket handler
  useEffect(() => {
    websocketService.setLLMCallback(async (message: string): Promise<LLMCallbackResult> => {
      try {
        if (isAISpeaking || isPlayingAudio || chatProcessing) {
          console.log('Skipping message processing - system busy');
          return {
            processed: false,
            error: 'System is busy processing previous message'
          };
        }
        
        await handleSendChat(message);
        return {
          processed: true
        };
      } catch (error) {
        console.error('Error processing message:', error);
        return {
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    });
  }, [handleSendChat, chatProcessing, isPlayingAudio, isAISpeaking]);

  const handleOpenRouterKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = event.target.value;
    setOpenRouterKey(newKey);
    localStorage.setItem('openRouterKey', newKey);
  };

  const handleAiProviderChange = useCallback((provider: AIProvider) => {
    setAiProvider(provider);
    localStorage.setItem('aiProvider', provider);
    setLlmModel((currentModel) => {
      const previousDefault = getDefaultModel(
        provider === "openrouter" ? "apipedia" : "openrouter"
      );
      const nextModel =
        !currentModel || currentModel === previousDefault
          ? getDefaultModel(provider)
          : currentModel;
      localStorage.setItem('llmModel', nextModel);
      return nextModel;
    });
  }, []);

  const handleLlmApiKeyChange = useCallback((value: string) => {
    setLlmApiKey(value);
    localStorage.setItem('llmApiKey', value);
  }, []);

  const handleLlmModelChange = useCallback((value: string) => {
    setLlmModel(value);
    localStorage.setItem('llmModel', value);
  }, []);

  const handleElevenLabsVoiceChange = useCallback(
    (voiceId: string) => {
      setElevenLabsParam({ voiceId });
    },
    []
  );

  const handleSpeechSynthesisParamChange = useCallback(
    (param: SpeechSynthesisParam) => {
      setSpeechSynthesisParam(param);
      localStorage.setItem('speechSynthesisParam', JSON.stringify(param));
    },
    []
  );

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      <Meta />
      <Introduction
        openAiKey={openAiKey}
        aiProvider={aiProvider}
        llmApiKey={llmApiKey}
        llmModel={llmModel}
        onChangeAiKey={setOpenAiKey}
        onChangeAiProvider={handleAiProviderChange}
        onChangeLlmApiKey={handleLlmApiKeyChange}
        onChangeLlmModel={handleLlmModelChange}
        elevenLabsKey={elevenLabsKey}
        onChangeElevenLabsKey={setElevenLabsKey}
        voiceProvider={voiceProvider}
        onChangeVoiceProvider={setVoiceProvider}
        elevenLabsParam={elevenLabsParam}
        onChangeElevenLabsVoice={handleElevenLabsVoiceChange}
        speechSynthesisParam={speechSynthesisParam}
        onChangeSpeechSynthesisParam={handleSpeechSynthesisParamChange}
      />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        openAiKey={openAiKey}
        aiProvider={aiProvider}
        llmApiKey={llmApiKey}
        llmModel={llmModel}
        elevenLabsKey={elevenLabsKey}
        openRouterKey={openRouterKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        elevenLabsParam={elevenLabsParam}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        voiceProvider={voiceProvider}
        speechSynthesisParam={speechSynthesisParam}
        onChangeAiKey={setOpenAiKey}
        onChangeAiProvider={handleAiProviderChange}
        onChangeLlmApiKey={handleLlmApiKeyChange}
        onChangeLlmModel={handleLlmModelChange}
        onChangeElevenLabsKey={setElevenLabsKey}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeElevenLabsParam={setElevenLabsParam}
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        backgroundImage={backgroundImage}
        onChangeBackgroundImage={setBackgroundImage}
        onTokensUpdate={handleTokensUpdate}
        onChatMessage={handleSendChat}
        onChangeOpenRouterKey={handleOpenRouterKeyChange}
        onChangeVoiceProvider={setVoiceProvider}
        onChangeSpeechSynthesisParam={setSpeechSynthesisParam}
      />
      <GitHubLink />
    </div>
  );
}
