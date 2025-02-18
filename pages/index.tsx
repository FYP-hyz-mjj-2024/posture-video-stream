import React, { useEffect, useRef, useState } from 'react';
import Indicator from "@/components/Indicator";
import codes from "@/data/WSCode";
import { WS_URL } from "@/utils/pathMap";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [announcedFaces, setAnnouncedFaces] = useState<string[]>([]);

  const [showLatencyDesc, setShowLatencyDesc] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [haveVideoSource, setHaveVideoSource] = useState<boolean>(false);

  const [chartData, setChartData] = useState({
    labels: [] as String[],
    datasets: [
      {
        label: 'Latency (seconds)',
        data: [] as Number[],
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        // pointRadius: 0,
        // pointHitRadius: 0
      }
    ],
  });

  const videoFrameRef = useRef<HTMLImageElement>(null);



  useEffect(() => {
    if (videoFrameRef.current?.src && !haveVideoSource) {
      // No video source
      videoFrameRef.current.src = "";
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setWSCode(`Connected`);
      console.log(`Connected on ${WS_URL}`);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isPaused)   // If manually paused, doesn't react to the message.
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

      if (videoFrameRef.current && frameInfo.frameBase64) {
        videoFrameRef.current.src = `data:image/jpeg;base64,${frameInfo.frameBase64}`;
      }

      if (videoFrameRef.current && frameInfo.announced_face_frames) {
        setAnnouncedFaces(prevAnnouncedFaces => [...frameInfo.announced_face_frames, ...prevAnnouncedFaces].slice(0, 3));
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

  useEffect(() => {
    if (vidLatency == null) {
      return;
    }
    const newLabels = [...chartData.labels, ""];
    const newData = [...chartData.datasets[0].data, vidLatency];
    if (newData.length > 10) {
      newLabels.shift();
      newData.shift();
    }
    setChartData({
      labels: newLabels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: newData,
        }
      ]
    })
  }, [vidLatency]);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 `}>
      <title>Pedestrian Cell Phone Usage Detection</title>

      {/** Title */}
      <h1 className={`text-2xl flex flex-row gap-3 items-center justify-center`}>
        <p className={`font-bold text-[#ff7700]`}>{`<   >`}</p>
        Pedestrian Cell Phone Usage Detection
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
      <div className="flex flex-row">
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
        <div className=" flex flex-col w-36 border border-white gap-2">
          <div className={`flex flex-row items-center justify-center`}>
            <p>{`You broke the law!`}</p>
          </div>
          {announcedFaces?.map((v, k) => (
            <img key={k} src={`data:image/jpeg;base64,${v}`}
              className={`w-full`} />
          ))}
        </div>
      </div>

      <div className={`flex flew-row mt-2 gap-2`}>
        <div className={`opacity-50`}
          onMouseEnter={() => {
            setShowLatencyDesc(true);
          }}
          onMouseLeave={() => {
            setShowLatencyDesc(false);
          }}
        >{`ⓘ`}</div>
        <div>{`Latency: `}</div>
        <div>{vidLatency ? `${vidLatency.toFixed(3)} secs` : "Not Available"}</div>
      </div>

      <div className='flex flex-row mx-auto align-center justify-center' style={{ width: '640px', height: '120px' }}>
        <Line
          data={chartData}
          options={{
            animation: false,
            plugins: {
              legend: {
                display: false,
              }
            },
            scales: {
              x: {
                grid: { display: false }
              },
              y: {
                grid: { display: false }
              },
            }
          }} />
      </div>

      {showLatencyDesc && (
        <div className={`flex flex-row w-[480px] text-center opacity-50 text-xs mt-3 absolute bottom-5`}>
          <p>
            This is the latency between the beginning of stream-pushing a frame from the back-end to the receiving of this frame at the front-end.
          </p>
        </div>
      )}
    </main>
  );
}