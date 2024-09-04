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

export default function Home() {
  const [ws_message, setWSMessage] = useState("Idle");
  const [vidBase64, setVidBase64] = useState("");

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log("WebSocket Connection Established.");
      setWSMessage(`Connection Established.`);
    }

    ws.onmessage = (event: MessageEvent) => {
      console.log(`message received:`);
      const frame = extractBase64EncodedString(event);
      setVidBase64(frame);
    };

    ws.onerror = function (e: any) {
      setWSMessage(`Error occurred: ${e}`);
    }

    ws.onclose = function () {
      setWSMessage("Connection closed. Try refreshing to re-connect.");
    }
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>Smartphone Usage Detection</div>
      <div>Console:</div>
      <div>{ws_message}</div>

      {vidBase64 == "" ? (
        <div className={`flex items-center justify-center w-[640px] h-[480px] border border-white`}>
          <div className={`mx-auto`}>
            The connection is established, but there is no video source.
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
