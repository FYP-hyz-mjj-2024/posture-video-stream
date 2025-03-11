import React, { useEffect, useRef, useState } from 'react';
import Indicator from "@/components/Indicator";
import codes from "@/data/WSCode";
import { WS_URL } from "@/utils/pathMap";
import axios from "axios";
import { useRouter } from "next/router";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { getUser } from "@/lib/auth";
import { NavigationButton } from '@/components/buttons';
import { IoGrid } from 'react-icons/io5';

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
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);

  // Image frame ref of DOM
  const videoFrameRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Websocket connection status
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");

  // Video Latency
  const [vidLatency, setVidLatency] = useState<Number | null>(null);

  // Video source existence flag
  const [haveVideoSource, setHaveVideoSource] = useState<boolean>(false);

  // List of base64 strings of the announced faces
  const [announcedFaces, setAnnouncedFaces] = useState<string[]>([]);

  // Local display settings
  const [isPaused, setIsPaused] = useState<boolean>(false);
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

  /**
   * User Log out.
   */
  async function logOut() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    router.reload();
  }

  /**
   * Retrieve user data using token & id stored in local storage.
   * If there's no token or id, user had never logged in, therefore
   * stop retrieving and use anonymous mode.
   */
  useEffect(() => {
    let user_id = localStorage.getItem("user_id");
    let token = localStorage.getItem("token");
    if (!user_id || !token) {
      return;
    }
    getUser({ user_id, token }).then((data) => {
      if (data) setUserData(data);
    });
  }, [])

  /**
   * Set up websocket video streaming.
   */
  useEffect(() => {
    // if (videoFrameRef.current?.src && !haveVideoSource) {
    //   // No video source
    //   videoFrameRef.current.src = "";
    // }
    let image = imageRef.current;
    if (!image) {
      image = new Image();
      imageRef.current = image;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setWSCode(`Connected`);
      console.log(`Connected on ${WS_URL}`);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isPaused)   // If manually paused, doesn't react to the message.
        return;

      // Data frame info: Either video frame or face announcing.
      const dataframeInfo = extractBase64EncodedString(event);

      // Receive terminate message, terminate streaming.
      if (!dataframeInfo || dataframeInfo.terminate) {
        if (videoFrameRef.current) {
          // videoFrameRef.current.src = "";
          setHaveVideoSource(false);
        }
        setVidLatency(null);
        return;
      }

      // Extract video frame
      if (videoFrameRef.current && imageRef.current && dataframeInfo.frameBase64) {
        // videoFrameRef.current.src = `data:image/jpeg;base64,${dataframeInfo.frameBase64}`;
        const canvas = videoFrameRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {

          imageRef.current.src = `data:image/jpeg;base64,${dataframeInfo.frameBase64}`;
          imageRef.current.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
        }
      }

      // Update face frame
      if (videoFrameRef.current && dataframeInfo.announced_face_frames) {
        setAnnouncedFaces(prevAnnouncedFaces => [...dataframeInfo.announced_face_frames, ...prevAnnouncedFaces].slice(0, 3));
      }

      // Receive a non-terminate message, set viideo source flag to true.
      if (!haveVideoSource) {
        setHaveVideoSource(true);
      }

      // Update message latency.
      setVidLatency(Date.now() / 1000 - parseFloat(dataframeInfo.timestamp));
    };

    ws.onerror = function (e: any) {
      setWSCode("Error");
      console.error(`An error regarding the websocket server client occurred. Error message: ${e.message || e}`);
    };

    ws.onclose = function () {
      setWSCode("Closed");
    };

    return () => {
      ws.close();
    };
  }, [isPaused]);

  /**
   * Setup video latency chart.
   */
  useEffect(() => {
    if (vidLatency == null) {
      return;
    }
    const newLabels = [...chartData.labels, ""];
    const newData = [...chartData.datasets[0].data, vidLatency];
    if (newData.length > 100) {
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
    <main className={`flex flex-col min-h-screen items-center justify-start gap-5 p-24`}>
      <title>Pedestrian Cell Phone Usage Detection</title>

      {/** Title */}
      <h1 className={`text-2xl flex flex-row gap-3 items-center justify-center`}>
        <p className={`font-bold text-[#ff7700]`}>{`<>`}</p>
        Pedestrian Cell Phone Usage Detection
        <p className={`font-bold text-[#ff7700]`}>{`</>`}</p>
      </h1>

      {/** Panel*/}
      <div className={`flex flex-col bg-white dark:bg-gray-900 px-20  py-4 rounded-xl justify-center`}>
        {/** Information Bar */}
        <div className={`flex flex-col gap-2 items-center`}>
          {/** User Data */}
          {userData ? (
            <div className={`flex flex-row gap-3`}>
              <p>{`Logged in as ${userData.name}`}</p>
              <p className={`hover:cursor-pointer`} onClick={logOut}>Log Out</p>
            </div>
          ) : (
            <div className={`flex flex-row gap-3`}>
              <p className={`italic opacity-50`}>Anonymous</p>
              <p className={`hover:cursor-pointer`} onClick={() => {
                router.push("user/login");
              }}>Log In</p>
            </div>
          )}

          {/** Connection Indicator */}
          <div className={`flex flex-row items-center gap-2 p-2`}>
            <Indicator ws_code={ws_code} />
            <div>{codes[ws_code].Prompt}</div>
          </div>
        </div>

        {/** Video and Announced Faces */}
        <div className="flex flex-row">
          {/** Video Frame */}
          {!haveVideoSource ? (
            <div className={`flex items-center justify-center w-[600px] h-[400px] border border-white`}>
              <div className={`mx-auto`}>
                {codes[ws_code].VideoPrompt}
              </div>
            </div>
          ) : (
            <canvas
              ref={videoFrameRef}
              // alt="Video Frame"
              className={`select-none drag-none w-[600px] h-[400px] border border-white`} />
          )}

          {/** Announced Face Frames */}
          <div className="flex border border-white pt-3 gap-3 flex-col items-center w-36">
            {
              announcedFaces?.length > 0 ?
                (announcedFaces?.map((v, k) => (
                  <img key={k} src={`data:image/jpeg;base64,${v}`}
                    className={`w-[80%] max-lg:h-4/5`} />
                ))) : (
                  <p className="w-full text-center">No Faces Announced</p>
                )
            }
          </div>
        </div>

        {/** Video Latency Panel */}
        <div className='flex flex-col border border-white align-center justify-center gap-2'>

          {/** Video Latency Text */}
          <div className={`flex flew-row w-full gap-2 justify-center`}>
            <div>{`Latency: `}</div>
            <div>{vidLatency ? `${vidLatency.toFixed(3)} secs` : "Not Available"}</div>
          </div>

          <div className="flex flex-row h-32">
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
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
        </div>

        {/** Features */}
        <div className='flex flex-row gap-2 items-center justify-center mt-4'>
          <NavigationButton to={"/face/manage_faces"} text={`Manage Faces`} Icon={IoGrid} router={router} />
        </div>
      </div>





    </main>
  );
}