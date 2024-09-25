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
    return {
      frameBase64: parsedJson.frameBase64,
      timestamp: parsedJson.timestamp
    };
  } catch (e) {
    console.log(e);
    return ""
  }
};

export default function Home() {
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");

  // Live-Stream Video Feed
  const [vidBase64, setVidBase64] = useState("");
  const [vidLatency, setVidLatency] = useState<Number | null>(null);

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
      const frameInfo = extractBase64EncodedString(event);
      if (!frameInfo)
        return
      setVidBase64(frameInfo.frameBase64);
      setVidLatency(Date.now() / 1000 - parseFloat(frameInfo.timestamp))
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

      {/** Title */}
      <h1 className={`text-2xl flex flex-row gap-3 items-center justify-center`}>
        <p className={`font-bold text-[#ff7700]`}>{`<   >`}</p>
        Smartphone Usage Detection
        <p className={`font-bold text-[#ff7700]`}>{`< / >`}</p>
      </h1>

      {/** Pause Button */}
      <div
        className={`hover:cursor-pointer ${!vidBase64 && 'opacity-20'}`}
        onClick={() => {
          if (!vidBase64)
            return;
          setIsPaused(!isPaused);
        }}>
        {vidBase64 ? (isPaused ? "Resume" : "Pause") : ("No Video Source")}
      </div>

      {/** Connection Indicator */}
      <div className={`flex flex-row items-center gap-2 p-2`}>
        <Indicator ws_code={ws_code} />
        <div>{codes[ws_code].Prompt}</div>
      </div>

      {/** Video Frame */}
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

      <div className={`flex flew-row gap-2`}>
        <div>{`Latency: `}</div>
        <div>{vidLatency ? `${vidLatency.toFixed(3)} secs` : "Not Available"}</div>
      </div>
    </main>
  );
}
