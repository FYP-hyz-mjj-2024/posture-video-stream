import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { Inter } from "next/font/google";
// import * as WebSocket from 'ws';

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
const setVideoSrc = (videoRef: React.RefObject<HTMLVideoElement>, received_data: string) => {
  if (!videoRef.current) {
    return;
  }

  try {

    const base64Data = received_data;
    const contentType = 'image/jpeg';

    const blob = base64ToBlob(base64Data, contentType);
    const url = URL.createObjectURL(blob);

    videoRef.current.srcObject = null;
    videoRef.current.src = url;
    videoRef.current.play();
  } catch (e) {
    // setWSMessage(`${e}`);
    console.log(e);
  }
}


export default function Home() {
  const videoRef = React.createRef<HTMLVideoElement>();
  const [ws_message, setWSMessage] = useState("Idle");
  const [ws_data, setWSData] = useState("cleared");

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      // console.log("WebSocket Connection Successful.");
      setWSMessage(`Connection Established.`);
    }

    ws.onmessage = (event: MessageEvent) => {
      console.log(`message received: ${event.data}`);
      // let received_data = JSON.parse(event.data).message;
      // setWSData(received_data.slice(0, 100));
      // setVideoSrc(videoRef, received_data);
    };

    ws.onerror = function (e: any) {
      setWSMessage(`Error occurred: ${e}`);
    }

    ws.onclose = function () {
      setWSMessage("Connection closed.");
    }

    // return () => {
    //   ws.close();
    // };
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
