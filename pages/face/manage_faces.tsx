"use client";

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from "next/router";
import Image from "next/image";
import axios from 'axios';

import { getUser } from '@/lib/auth';
import moment from "moment";

const buttonStyle = `border border-ui-line rounded-md text-center hover:cursor-pointer select-none hover:bg-ui-area`;

export default function Login() {
    const router = useRouter();
    const [curPage, setCurPage] = useState<number>(0);
    const [faces, setFaces] = useState<Face[]>([]);

    const [numThisPage, setNumThisPage] = useState<number>(0);
    const [numTotal, setNumTotal] = useState<number>(0);

    const pageMaxNum = 5;

    /**
     * Retrieve faces given a range.
     * @param facesGet User auth and face range.
     * @returns If success, return a list of faces. Otherwise return null.
     */
    async function getFaces(facesGet: FacesGet): Promise<FacesGetResult | null> {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/get_faces`,
                facesGet,
            );
            return response.data;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Protected page. Need user authorize.
     */
    useEffect(() => {
        const user_id = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        if (!user_id || !token) {
            router.push("/");
            return;
        }

        getUser({ user_id, token }).then((data) => {
            if (!data) {
                router.push("/");
                return;
            }
        });
    });


    /**
     * Retrieve faces.
     */
    useEffect(() => {
        const user_id = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        const range_from = curPage * pageMaxNum;
        const range_to = range_from + pageMaxNum - 1;

        if (!user_id || !token) {
            return;
        }

        getFaces({
            user_id: user_id,
            token: token,
            range_from: range_from,
            range_to: range_to
        }).then((data) => {
            if (data) {
                setNumTotal(data.num_total);
                setNumThisPage(data.num_this_page);
                setFaces(data.faces);
            }
        })

    }, [curPage]);


    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            {/** Panel */}
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 py-16 w-[80%] rounded-xl justify-center gap-10`}>

                {/** Title and face list */}
                <div className={`flex flex-col justify-center`}>
                    {/** Title */}
                    <div className={`flex flex-row justify-between border border-ui-line bg-ui-area rounded-tl-lg rounded-tr-lg px-4 py-3`}>
                        <p className={`font-bold`}>{`${numThisPage} / ${numTotal} faces`}</p>
                    </div>

                    {/** Face List */}
                    <div className={`flex flex-col max-h-[60vh] overflow-y-scroll`}>
                        {faces.length > 0 ? (

                            faces.map((face, id) => (
                                <div key={id} className={
                                    `flex flex-row border-x border-b border-ui-line px-4 py-3 justify-between
                                ${id == faces.length - 1 && `rounded-bl-lg rounded-br-lg`}
                                `}>

                                    {/** Face description and ID */}
                                    <div>
                                        <div className={`font-bold`}>
                                            {face.description}
                                        </div>
                                        <div className={`text-sm opacity-60`}>
                                            {face.id}
                                        </div>
                                        <div className={`text-sm opacity-60`}>
                                            {moment(face.uploaded_at).format("YYYY-MM-DD HH:mm:ss Z")}
                                        </div>
                                    </div>

                                    {/** Face Image */}
                                    <Image
                                        className={`rounded-lg`}
                                        src={`data:image/png;base64,${face.blob}`}
                                        alt={face.description}
                                        width={70}
                                        height={70} />
                                </div>
                            ))

                        ) : (
                            <div
                                className={`flex flex-row border-x border-b border-ui-line px-4 py-3 justify-between
                                        rounded-bl-lg rounded-br-lg
                                    `}>
                                No faces
                            </div>
                        )}

                    </div>
                </div>

                {/** Page Selector */}
                <div className={`flex flex-row w-[45%] justify-between mx-auto`}>
                    {/** Previous Page */}
                    <div className={`${buttonStyle} px-3 pt-0.5 ${curPage <= 0 && `opacity-50`}`}
                        onClick={() => {
                            if (curPage > 0) {
                                setCurPage(curPage - 1)
                            }
                        }}>
                        {`Prev`}
                    </div>

                    {/** Page List */}
                    {Array.from({ length: Math.min(Math.ceil(numTotal / pageMaxNum) - Math.floor(curPage / 7) * 7, 7) }, (_, i) => Math.floor(curPage / 7) * 7 + i + 1)
                        .map((k, i) => (
                            <div className={` ${buttonStyle} w-[2em] h-[2em] pt-0.5 rounded-md ${k - 1 == curPage && `font-bold`}`}
                                onClick={() => { setCurPage(i) }}>
                                {k}
                            </div>
                        ))}

                    {/** Next Page */}
                    <div className={`${buttonStyle} px-3 pt-0.5  ${curPage >= Math.ceil(numTotal / pageMaxNum) - 1 && `opacity-50`}`}
                        onClick={() => {
                            if (curPage < Math.ceil(numTotal / pageMaxNum) - 1) {
                                setCurPage(curPage + 1)
                            }
                        }}>
                        <p>{`Next`}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}