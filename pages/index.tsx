import React, { useEffect, useState } from 'react';
import { Inter } from "next/font/google";
import Indicator from "@/components/Indicator";
import codes from "@/data/WSCode";

const inter = Inter({ subsets: ["latin"] });

/**
 * Given a websocket onMessage event, extract the base64 string.
 * @param wsOnMessageEvent 
 * @returns 
 */
const extractBase64EncodedString = (wsOnMessageEvent: MessageEvent<any>) => {
  try {
    let byte_arr = JSON.parse(wsOnMessageEvent.data).data;
    let byte_string = String.fromCharCode.apply(null, byte_arr);
    let parsedJson = JSON.parse(byte_string);
    let base64EncodedString = parsedJson.message;
    return base64EncodedString;
  } catch (e) {
    console.log(e);
    return ""
  }
};

export default function Home() {
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");
  const [vidBase64, setVidBase64] = useState("");

  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      setWSCode("Connected");
    }

    ws.onmessage = (event: MessageEvent) => {
      if (isPaused)
        return
      console.log(`message received:`);
      const frame = extractBase64EncodedString(event);
      setVidBase64(frame);
    };

    ws.onerror = function (e: any) {
      setWSCode("Error");
      console.log(e);
    }

    ws.onclose = function () {
      setWSCode("Closed");
    }

    return () => {
      ws.close();
    }
  }, [isPaused]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <title>Smartphone Usage Detection</title>

      <h1>Smartphone Usage Detection</h1>

      <div
        className={`hover:cursor-pointer ${!vidBase64 && 'opacity-20'}`}
        onClick={() => {
          if (!vidBase64)
            return;
          setIsPaused(!isPaused);
        }}>
        {vidBase64 ? (isPaused ? "Resume" : "Pause") : ("No Video Source")}
      </div>

      <div className={`flex flex-row items-center gap-2 p-2`}>
        <Indicator ws_code={ws_code} />
        <div>{codes[ws_code].Prompt}</div>
      </div>

      {vidBase64 == "" ? (
        <div className={`flex items-center justify-center w-[640px] h-[480px] border border-white`}>
          <div className={`mx-auto`}>
            {codes[ws_code].VideoPrompt}
          </div>
        </div>
      ) : (
        <img
          src={`data:image/jpeg;base64,${vidBase64}`}
          alt="Video Frame"
          className={`select-none drag-none`} />
      )}
    </main>
  );
}
