import React, { useEffect, useState } from 'react';
import { Inter } from "next/font/google";

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

const codes = {
  "Connected": {
    "Prompt": "Connection Established.",
    "Color": "#00FF00",
    "VideoPrompt": "The connection is established, but there is no video source."
  },
  "Closed": {
    "Prompt": "Connection Closed. Try re-freshing to re-connect.",
    "Color": "#FF0000",
    "VideoPrompt": "The connection is closed, therefore we can't receive any video source."
  },
  "Error": {
    "Prompt": "Error Occurred. Please refresh.",
    "Color": "#FFFF00",
    "VideoPrompt": "There is an error in the connection."
  }
}

export default function Home() {
  const [ws_message, setWSMessage] = useState("Idle");
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");
  const [vidBase64, setVidBase64] = useState("");

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      setWSCode("Connected");
    }

    ws.onmessage = (event: MessageEvent) => {
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
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>Smartphone Usage Detection</div>
      <div>Console:</div>
      <div className={`flex flex-row items-center gap-2 p-2`}>
        <div className={`w-2 h-2 bg-[${codes[ws_code].Color}] rounded-full`} />
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
