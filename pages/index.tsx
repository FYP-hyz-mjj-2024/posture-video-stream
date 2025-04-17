// Site Packages
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from "next/router";
import { IoGrid, IoPeople } from 'react-icons/io5';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend
} from 'chart.js';
import Cookies from "js-cookie";

// Local UI Components
import { NavigationButton } from '@/components/buttons';
import Indicator from "@/components/Indicator";

// Local Data Components
import codes from "@/data/WSCode";
import { WS_URL } from "@/utils/pathMap";
import { _getUserAuth, getUser, logOut, permissions } from "@/lib/auth";
import { _getErrorMessage, compareFace } from '@/lib/server';
import { useDebounce } from "@/lib/utils"

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend
);


/**
 * Given a websocket onMessage event, extract the base64 string.
 * @param wsOnMessageEvent Message event.
 * @returns 
 */
const _getBase64FromWSMsg = (wsOnMessageEvent: MessageEvent<string>) => {
  try {
    let byte_arr = JSON.parse(wsOnMessageEvent.data).data;
    let byte_string = String.fromCharCode.apply(null, byte_arr);
    let parsedJson: WSMessages = JSON.parse(byte_string);
    return parsedJson;
  } catch (e) {
    console.error(`Unable to resolve message. Error:${e}`);
    return null;
  }
};


export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserBasic | null>(null);

  // Debounce face compare for 500 seconds.
  const d_compareFace = useDebounce(compareFace, 500);

  // Image frame ref of DOM
  const videoFrameRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Websocket connection status
  const [ws_code, setWSCode] = useState<"Connected" | "Closed" | "Error">("Closed");

  // Video Latency
  const [vidLatency, setVidLatency] = useState<Number | null>(null);

  // Video source existence flag
  const [haveVideoSource, setHaveVideoSource] = useState<boolean>(false);

  // List of headerless base64 strings of the announced faces
  const [announcedFaces, setAnnouncedFaces] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Latency chart settings.
  const [chartData, setChartData] = useState({
    labels: [] as String[],
    datasets: [
      {
        label: 'Latency (seconds)',
        data: [] as Number[],
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      }
    ],
  });

  /**
   * Retrieve user data using token & id stored in local storage.
   * If there's no token or id, user had never logged in, therefore
   * stop retrieving and use anonymous mode.
   */
  useEffect(() => {
    getUser({
      onAuthFailCallback: (e) => {
        const message = _getErrorMessage(e);
        window.alert(message);
        router.push("/");
      },
      onSuccessCallback: (response) => {
        const data: UserBasic = response.data;
        setUserData(data);
      },
      onFailCallback: (e) => {
        const message = _getErrorMessage(e);
        window.alert(message);
      }
    })
  }, [])

  /**
   * Set up websocket video streaming.
   */
  useEffect(() => {
    /**
     * The image object to render video frames on the canvas.
     */
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
      // Data frame info: Either video frame or face announcing.
      const wsMsg: WSMessages | null = _getBase64FromWSMsg(event);

      // Receive terminate message, terminate streaming.
      if (!wsMsg || (wsMsg as WSTerminateMsg).terminate) {
        if (videoFrameRef.current) {
          setHaveVideoSource(false);
        }
        setVidLatency(null);
        return;
      }

      /**
       * Received a video frame message from websocket.
       * Decode and render the base64 message on canvas.
       */
      if (
        videoFrameRef.current && imageRef.current &&
        (wsMsg as WSVideoFrameMsg).frameBase64
      ) {
        const canvas = videoFrameRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fixed to use jpeg in the inference backend.
          imageRef.current.src = `data:image/jpeg;base64,${(wsMsg as WSVideoFrameMsg).frameBase64}`;
          imageRef.current.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
        }
      }

      /**
       * Received a face announce message from websocket.
       * Decode the list of base64 faces and render in the list.
       * Push the new faces on top of the old ones.
       */
      if (
        videoFrameRef.current &&
        (wsMsg as WSFaceAnnounceMsg).announced_face_frames
      ) {
        setAnnouncedFaces((prevAnnouncedFaces) =>
          [
            ...(wsMsg as WSFaceAnnounceMsg).announced_face_frames,  // New faces
            ...prevAnnouncedFaces   // Old ones
          ].slice(0, 3));
      }

      /**
       * Receive a non-terminate message, 
       * set the have-video-source flag to true.
       */
      if (!haveVideoSource) {
        setHaveVideoSource(true);
      }

      /**
       * Update message latency.
       */
      setVidLatency(Date.now() / 1000 - parseFloat(
        (wsMsg as WSVideoFrameMsg | WSFaceAnnounceMsg).timestamp)
      );
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
  }, []);

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
    <main className={`flex flex-col min-h-screen items-center justify-start gap-5 p-12`}>
      <title>Pedestrian Cell Phone Usage Detection</title>

      {/** Title */}
      <h1 className={`text-2xl flex flex-row gap-3 items-center justify-center`}>
        <p className={`font-bold text-[#ff7700]`}>{`<>`}</p>
        Pedestrian Cell Phone Usage Detection
        <p className={`font-bold text-[#ff7700]`}>{`</>`}</p>
      </h1>

      <div>
        {selectedName ? (<p>{selectedName}</p>) : (<p>No selected names.</p>)}
      </div>

      {/** Panel*/}
      <div className={`flex flex-col bg-white dark:bg-gray-900 px-20  py-4 rounded-xl justify-center`}>
        {/** Information Bar */}
        <div className={`flex flex-col gap-2 items-center`}>
          {/** User Data */}
          {userData ? (
            <div className={`flex flex-row gap-3`}>
              <p>{`Logged in as ${userData.name}`}</p>
              <p className={`hover:cursor-pointer`} onClick={() => {
                logOut(router);
              }}>
                {`Log Out`}
              </p>
            </div>
          ) : (
            <div className={`flex flex-row gap-3`}>
              <p className={`italic opacity-50`}>Anonymous</p>
              <p className={`hover:cursor-pointer`} onClick={() => {
                router.push("user/login");
              }}>
                {`Login`}
              </p>
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
            <div className={`flex items-center justify-center w-[600px] h-[400px] border border-gray-400`}>
              <div className={`mx-auto`}>
                {codes[ws_code].VideoPrompt}
              </div>
            </div>
          ) : (
            <canvas
              ref={videoFrameRef}
              // alt="Video Frame"
              className={`select-none drag-none w-[600px] h-[400px] border border-gray-400`} />
          )}

          {/** Announced Face Frames */}
          <div className="flex border-y border-r border-gray-400 pt-3 gap-3 flex-col items-center w-36">
            {
              announcedFaces?.length > 0 ?
                (announcedFaces.map((v, k) => (
                  <div key={k} className={`w-[80%] max-lg:h-4/5 hover:cursor-pointer hover:opacity-50`}>
                    <img
                      src={`data:image/jpeg;base64,${v}`}
                      className={`w-full`}
                      onClick={() => {
                        if (!userData) {
                          return;
                        }

                        d_compareFace(
                          { blob: `data:image/jpeg;base64,${v}` } as FaceCompareSubmit,
                          {
                            onAuthFailCallback: (e) => {
                              const message = _getErrorMessage(e);
                              window.alert(message);
                              router.push("/");
                            },
                            onSuccessCallback: (response) => {
                              const _faceCompareResults: FaceCompareResults = response.data;
                              const _selectedName = `${_faceCompareResults.desc_scores[0].description} - ${_faceCompareResults.desc_scores[0].score}`;
                              setSelectedName(_selectedName);
                            },
                            onFailCallback: (e) => {
                              const message = _getErrorMessage(e);
                              window.alert(message);
                            },
                          });
                      }} />
                  </div>
                ))) : (
                  <p className="w-full text-center">No Faces Announced</p>
                )
            }
          </div>
        </div>

        {/** Video Latency Panel */}
        <div className='flex flex-col border-b border-x border-gray-400 align-center justify-center gap-2'>

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
        {userData && (
          <div className='flex flex-row gap-2 items-center justify-center mt-4'>
            <NavigationButton to={"/face/manage_faces"} text={`Manage Faces`} Icon={IoGrid} router={router} />
            {Boolean(userData.permissions & permissions.GRANT_PERMISSION) &&
              (<NavigationButton to={"/user/manage_users"} text={`Manage Users`} Icon={IoPeople} router={router} />)}
          </div>
        )}
      </div>
    </main>
  );
}