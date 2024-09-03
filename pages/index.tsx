import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

function base64ToBlob(base64: string, contentType: string) {
  const byteChars = atob(base64);
  const byteArrs = [];

  for (let offset = 0; offset < byteChars.length; offset += 1024) {
    const slice = byteChars.slice(offset, offset + 1024);
    const byteNums = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNums[i] = slice.charCodeAt(i);
    }

    const byteArr = new Uint8Array(byteNums);
    byteArrs.push(byteArr);
  }

  return new Blob(byteArrs, { type: contentType });
}

export default function Home() {
  const videoRef = React.createRef<HTMLVideoElement>();
  const [ws_message, setWSMessage] = useState("Idle");
  const [ws_data, setWSData] = useState("cleared");

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log("WebSocket Connection Successful.");
    }

    ws.onmessage = (event) => {
      if (!videoRef.current)
        return;

      let received_data = event.data;
      setWSData(received_data.slice(0, 100));

      try {
        const data = JSON.parse(event.data);
        if (!data.message) {
          setWSMessage(data);
          return;
        }
        setWSMessage(data);

        const base64Data = data.message;
        const contentType = 'image/jpeg';

        const blob = base64ToBlob(base64Data, contentType);
        const url = URL.createObjectURL(blob);

        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.play();
      } catch (e) {
        setWSMessage(`${e}`);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>Smartphone Usage Detection</div>
      <div>Console:</div>
      <div>{ws_message}</div>

      <div>Data:</div>
      <div>{ws_data}</div>
      <video ref={videoRef} autoPlay playsInline />
    </main>
  );
}
