"use client";

import { createMessage } from "@/app/(main)/actions";
import LogoSmall from "@/components/icons/logo-small";
import { splitByFirstCodeFence } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import Together from "together-ai";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import CodeViewerLayout from "./code-viewer-layout";
import type { Chat, Message } from "./page";
import { Context } from "../../providers";

export default function PageClient({ chat }: { chat: Chat }) {
  const context = use(Context);
  const [streamPromise, setStreamPromise] = useState<Promise<ReadableStream> | undefined>(undefined);
  const [streamText, setStreamText] = useState("");
  const [isShowingCodeViewer, setIsShowingCodeViewer] = useState(
    chat.messages.some((m: Message) => m.role === "assistant"),
  );
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const router = useRouter();
  const isHandlingStreamRef = useRef(false);
  const [activeMessage, setActiveMessage] = useState(
    chat.messages.filter((m: Message) => m.role === "assistant").at(-1),
  );

  useEffect(() => {
    if (!streamPromise || isHandlingStreamRef.current) return;
    isHandlingStreamRef.current = true;

    streamPromise.then(async (stream) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let finalText = "";
      let didPushToCode = false;
      let didPushToPreview = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line) continue;
            try {
              const { choices } = JSON.parse(line);
              const delta = choices?.[0]?.delta?.content || choices?.[0]?.text || "";
              if (delta) {
                finalText += delta;
                setStreamText(finalText);

                if (
                  !didPushToCode &&
                  splitByFirstCodeFence(finalText).some(
                    (part) => part.type === "first-code-fence-generating"
                  )
                ) {
                  didPushToCode = true;
                  setIsShowingCodeViewer(true);
                  setActiveTab("code");
                }

                if (
                  !didPushToPreview &&
                  splitByFirstCodeFence(finalText).some(
                    (part) => part.type === "first-code-fence"
                  )
                ) {
                  didPushToPreview = true;
                  setIsShowingCodeViewer(true);
                  setActiveTab("preview");
                }
              }
            } catch (e) {
              console.error("Error parsing line:", e);
            }
          }
        }

        const message = await createMessage(chat.id, finalText, "assistant");
        setStreamPromise(undefined);
        setStreamText("");
        setActiveMessage(message);
        router.refresh();
      } catch (error) {
        console.error("Error reading stream:", error);
      } finally {
        reader.releaseLock();
        isHandlingStreamRef.current = false;
      }
    });
  }, [streamPromise, chat.id, router]);

  return (
    <div className="h-dvh">
      <div className="flex h-full">
        <div className="mx-auto flex w-full shrink-0 flex-col overflow-hidden lg:w-1/2">
          <div className="flex items-center gap-4 px-4 py-4">
            <Link href="/">
              <LogoSmall />
            </Link>
            <p className="italic text-gray-500">{chat.title}</p>
          </div>

          <ChatLog
            chat={chat}
            streamText={streamText}
            activeMessage={activeMessage}
            onMessageClick={(message) => {
              if (message !== activeMessage) {
                setActiveMessage(message);
                setIsShowingCodeViewer(true);
              } else {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }
            }}
          />

          <ChatBox
            chat={chat}
            onNewStreamPromise={setStreamPromise}
            isStreaming={!!streamPromise}
          />
        </div>

        <CodeViewerLayout
          isShowing={isShowingCodeViewer}
          onClose={() => {
            setActiveMessage(undefined);
            setIsShowingCodeViewer(false);
          }}
        >
          {isShowingCodeViewer && (
            <CodeViewer
              streamText={streamText}
              chat={chat}
              message={activeMessage}
              onMessageChange={setActiveMessage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => {
                setActiveMessage(undefined);
                setIsShowingCodeViewer(false);
              }}
              onRequestFix={(error: string) => {
                startTransition(async () => {
                  let newMessageText = `The code is not working. Can you fix it? Here's the error:\n\n`;
                  newMessageText += error.trimStart();
                  const message = await createMessage(
                    chat.id,
                    newMessageText,
                    "user",
                  );

                  const streamPromise = fetch(
                    "/api/get-next-completion-stream-promise",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        messageId: message.id,
                        model: chat.model,
                      }),
                    },
                  ).then((res) => {
                    if (!res.body) {
                      throw new Error("No body on response");
                    }
                    return res.body;
                  });
                  setStreamPromise(streamPromise);
                  router.refresh();
                });
              }}
            />
          )}
        </CodeViewerLayout>
      </div>
    </div>
  );
}
