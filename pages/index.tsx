import React, { useEffect, useRef, useState } from 'react';
import Indicator from "@/components/Indicator";
import codes from "@/data/WSCode";
import { WS_URL } from "@/utils/pathMap";

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
    return parsedJson;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default function Home() {
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");
  const [vidLatency, setVidLatency] = useState<Number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [haveVideoSource, setHaveVideoSource] = useState<boolean>(false);

  const videoFrameRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (videoFrameRef.current?.src) {
      videoFrameRef.current.src = "";
    }

    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      setWSCode(`Connected`);
      console.log(`Connected on ${WS_URL}`);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isPaused)
        return;
      console.log(`message received:`);
      const frameInfo = extractBase64EncodedString(event);
      if (!frameInfo || frameInfo.terminate) {
        if (videoFrameRef.current) {
          videoFrameRef.current.src = "";
          setHaveVideoSource(false);
        }
        setVidLatency(null);
        return;
      }
      if (videoFrameRef.current) {
        videoFrameRef.current.src = `data:image/jpeg;base64,${frameInfo.frameBase64}`;
      }

      if (!haveVideoSource) {
        setHaveVideoSource(true);
      }
      setVidLatency(Date.now() / 1000 - parseFloat(frameInfo.timestamp));
    };

    ws.onerror = function (e: any) {
      setWSCode("Error");
      console.log(e);
    };

    ws.onclose = function () {
      setWSCode("Closed");
    };

    return () => {
      ws.close();
    };
  }, [isPaused]);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 `}>
      <title>Smartphone Usage Detection</title>

      {/** Title */}
      <h1 className={`text-2xl flex flex-row gap-3 items-center justify-center`}>
        <p className={`font-bold text-[#ff7700]`}>{`<   >`}</p>
        Smartphone Usage Detection
        <p className={`font-bold text-[#ff7700]`}>{`</>`}</p>
      </h1>

      {/** Pause Button */}
      <div
        className={`hover:cursor-pointer ${!videoFrameRef.current?.src && 'opacity-20'}`}
        onClick={() => {
          if (!videoFrameRef.current?.src)
            return;
          setIsPaused(!isPaused);
        }}>
        {videoFrameRef.current?.src ? (isPaused ? "Resume" : "Pause") : ("No Video Source")}
      </div>

      {/** Connection Indicator */}
      <div className={`flex flex-row items-center gap-2 p-2`}>
        <Indicator ws_code={ws_code} />
        <div>{codes[ws_code].Prompt}</div>
      </div>

      {/** Video Frame */}
      {!haveVideoSource ? (
        <div className={`flex items-center justify-center w-[640px] h-[480px] border border-white`}>
          <div className={`mx-auto`}>
            {codes[ws_code].VideoPrompt}
          </div>
        </div>
      ) : (
        <img
          ref={videoFrameRef}
          alt="Video Frame"
          className={`select-none drag-none w-[640px] h-[480px]`} />
      )}
      {/* <img
        ref={videoFrameRef}
        alt="Video Frame"
        className={`select-none drag-none`} /> */}

      <div className={`flex flew-row mt-2 gap-2`}>
        <div>{`Latency: `}</div>
        <div>{vidLatency ? `${vidLatency.toFixed(3)} secs` : "Not Available"}</div>
      </div>
    </main>
  );
}