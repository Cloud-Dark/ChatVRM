import { MessageInput } from "@/components/messageInput";
import { useState, useEffect, useCallback, useRef } from "react";

type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
};

/**
 * テキスト入力と音声入力を提供する
 *
 * 音声認識の完了時は自動で送信し、返答文の生成中は入力を無効化する
 *
 */
export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
}: Props) => {
  const [userMessage, setUserMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMicRecording, setIsMicRecording] = useState(false);
  const isMicRecordingRef = useRef(false);

  // 音声認識の結果を処理する
  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < results.length; i++) {
        const transcript = results[i][0].transcript;
        if (results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setUserMessage(finalTranscript);
        onChatProcessStart(finalTranscript);
      } else {
        setUserMessage(interimTranscript);
      }
    },
    [onChatProcessStart]
  );

  // 無音が続いた場合も終了するが、isMicRecordingがtrueなら再開する
  const handleRecognitionEnd = useCallback(() => {
    if (isMicRecordingRef.current) {
      console.log("Speech recognition ended unexpectedly, restarting...");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to restart speech recognition:", e);
        setIsMicRecording(false);
        isMicRecordingRef.current = false;
      }
    } else {
      setIsMicRecording(false);
    }
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (isMicRecording) {
      isMicRecordingRef.current = false;
      recognitionRef.current?.abort();
      setIsMicRecording(false);

      return;
    }

    recognitionRef.current?.start();
    setIsMicRecording(true);
    isMicRecordingRef.current = true;
  }, [isMicRecording]);

  const handleClickSendButton = useCallback(() => {
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    // FirefoxなどSpeechRecognition非対応環境対策
    if (!SpeechRecognition) {
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true; // 認識の途中結果を返す
    recognition.continuous = true; // 常に聞き取りを続ける

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    recognitionRef.current = recognition;

    return () => {
      recognition.removeEventListener("result", handleRecognitionResult);
      recognition.removeEventListener("end", handleRecognitionEnd);
      recognition.abort();
    };
  }, [handleRecognitionResult, handleRecognitionEnd]);

  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);

  return (
    <MessageInput
      userMessage={userMessage}
      isChatProcessing={isChatProcessing}
      isMicRecording={isMicRecording}
      onKeyDownUserMessage={(e) => {
        if (e.key === "Enter") {
          handleClickSendButton();
        }
      }}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
      onClickMicButton={handleClickMicButton}
      onClickSendButton={handleClickSendButton}
    />
  );
};
