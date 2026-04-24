import { Message } from "../messages/messages";
import { getWindowAI } from 'window.ai';
import { AIProvider, getDefaultModel } from "./providers";

export async function getChatResponse(messages: Message[], apiKey: string) {
  // function currently not used
  throw new Error("Not implemented");

  /*
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  // ブラウザからAPIを叩くときに発生するエラーを無くすworkaround
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "エラーが発生しました";

  return { message: message };
  */
}

export async function getChatResponseStream(
  messages: Message[],
  provider: AIProvider,
  apiKey: string,
  model: string
) {
  const selectedModel = model || getDefaultModel(provider);

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        if (!apiKey) {
          throw new Error(`Missing API key for ${provider}`);
        }

        if (provider === "apipedia") {
          const generation = await fetch(
            "https://integrator.apipedia.id/api/ai/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: selectedModel,
                messages,
                temperature: 0.7,
                max_tokens: 200,
              }),
            }
          );

          if (!generation.ok) {
            const errorText = await generation.text();
            throw new Error(
              `APIPedia request failed (${generation.status}): ${errorText}`
            );
          }

          const response = await generation.json();
          const content = response?.choices?.[0]?.message?.content;

          if (!content) {
            throw new Error("APIPedia returned an empty response");
          }

          controller.enqueue(content);
        } else {
          const YOUR_SITE_URL = 'https://chat-vrm-window.vercel.app/';
          const YOUR_SITE_NAME = 'ChatVRM';
          let isStreamed = false;

          const generation = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "HTTP-Referer": `${YOUR_SITE_URL}`,
              "X-Title": `${YOUR_SITE_NAME}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: selectedModel,
              messages,
              temperature: 0.7,
              max_tokens: 200,
              stream: true,
            })
          });

          if (!generation.ok) {
            const errorText = await generation.text();
            throw new Error(
              `OpenRouter request failed (${generation.status}): ${errorText}`
            );
          }

          if (generation.body) {
            const reader = generation.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                let chunk = new TextDecoder().decode(value);
                let lines = chunk.split('\n');
                const SSE_COMMENT = ": OPENROUTER PROCESSING";

                lines = lines.filter((line) => !line.trim().startsWith(SSE_COMMENT));
                lines = lines.filter((line) => !line.trim().endsWith("data: [DONE]"));

                const dataLines = lines.filter((line) => line.startsWith("data:"));
                const streamMessages = dataLines.map((line) =>
                  JSON.parse(line.substring(5))
                );

                streamMessages.forEach((message) => {
                  const content = message.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(content);
                  }
                });

                isStreamed = true;
              }
            } catch (error) {
              console.error('Error reading the stream', error);
              throw error;
            } finally {
              reader.releaseLock();
            }
          }

          if (!isStreamed) {
            throw new Error("OpenRouter streaming response was empty");
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}
