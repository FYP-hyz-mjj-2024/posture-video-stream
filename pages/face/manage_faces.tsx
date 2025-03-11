"use client";
// Package
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import Image from "next/image";
import axios from 'axios';
import moment from "moment";
import { IoMdArrowBack } from "react-icons/io";

// Local
import { guardPage } from '@/lib/auth';
import { NavigationButton } from '@/components/buttons';


const buttonStyle = `border rounded-md text-center hover:cursor-pointer select-none`;

export default function ManageFaces() {
    const router = useRouter();
    const [userData, setUserData] = useState<User | null>(null);
    const [curPage, setCurPage] = useState<number>(0);
    const [faces, setFaces] = useState<Face[]>([]);

    const [numThisPage, setNumThisPage] = useState<number>(0);
    const [numTotal, setNumTotal] = useState<number>(0);

    const pageMaxNum = 5;

    /**
     * Check for the magic number to determine file type.
     * @param blob Blob base64 string.
     * @returns 
     */
    function checkFileTypeFromBase64(blob: string) {
        if (blob.startsWith("iVBORw0KGgo")) {
            return "png";
        } else if (blob.startsWith("/9j/")) {
            return "jpg";
        } else {
            throw new DOMException("Invalid file format.");
        }
    }

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
        guardPage(router);
        const userData = localStorage.getItem("user_data");
        if (userData) {
            setUserData(JSON.parse(userData));
        }
    }, []);


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
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 py-16 w-[80%] rounded-xl justify-center gap-2`}>
                {/** Navigation Back */}
                <NavigationButton to={"/"} text={`Control Panel`} router={router} Icon={IoMdArrowBack} />

                {/** Names */}
                <div className={`flex flex-row justify-between items-center mb-6`}>
                    <div className={`font-bold text-2xl`}>
                        {`Face Management Dashboard`}
                    </div>
                    <div className={`flex flex-col items-end`}>
                        <p>{userData?.name}</p>
                        <p className={`text-sm opacity-50 max-lg:hidden`}>{userData?.user_id}</p>
                    </div>
                </div>

                {/** Tool Bar */}
                <div className={`flex flex-col w-20 ${buttonStyle} bg-ui-area-green hover:bg-ui-line-green text-white font-bold border border-ui-line-green
                                h-10 items-center justify-center`}
                    onClick={() => { router.push("./upload_face") }}>
                    <p>Upload</p>
                </div>

                {/** Title and face list */}
                <div className={`flex flex-col justify-center`}>
                    {/** Title */}
                    <div className={`flex flex-row justify-between border border-ui-line dark:border-ui-line-dark bg-ui-area dark:bg-ui-area-dark rounded-tl-lg rounded-tr-lg px-4 py-3`}>
                        <p className={`font-bold`}>{`${curPage * pageMaxNum + numThisPage} / ${numTotal} faces`}</p>
                    </div>

                    {/** Face List */}
                    <div className={`flex flex-col`}>
                        {faces.length > 0 ? (

                            faces.map((face, id) => (
                                <div key={id} className={
                                    `flex flex-row border-x border-b border-ui-line dark:border-ui-line-dark px-4 py-3 justify-between
                                ${id == faces.length - 1 && `rounded-bl-lg rounded-br-lg`}
                                `}>

                                    {/** Face description and ID */}
                                    <div>
                                        <div className={`font-bold`}>
                                            {face.description}
                                        </div>
                                        <div className={`text-sm opacity-60 max-lg:hidden`}>
                                            {face.id}
                                        </div>
                                        <div className={`text-sm opacity-60`}>
                                            {moment(face.uploaded_at).format("YYYY-MM-DD HH:mm:ss Z")}
                                        </div>
                                    </div>

                                    {/** Face Image */}
                                    <Image
                                        className={`rounded-lg w-16 h-16 object-cover`}
                                        src={`data:image/${checkFileTypeFromBase64(face.blob.slice(0, 15))};base64,${face.blob}`}
                                        alt={face.description}
                                        width={70}
                                        height={70} />
                                </div>
                            ))

                        ) : (
                            <div
                                className={`flex flex-row border-x border-b border-ui-line dark:border-ui-line-dark px-4 py-3 justify-between
                                        rounded-bl-lg rounded-br-lg
                                    `}>
                                No faces
                            </div>
                        )}

                    </div>
                </div>

                {/** Page Selector */}
                <div className={`flex flex-row w-[45%] max-lg:w-full justify-between mx-auto mt-6`}>
                    {/** Previous Page */}
                    <div className={`${buttonStyle} border-ui-line dark:border-ui-line-dark hover:bg-ui-area dark:hover:bg-ui-area-dark px-3 pt-0.5 ${curPage <= 0 && `opacity-50`}`}
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
                            <div className={` ${buttonStyle} border-ui-line dark:border-ui-line-dark hover:bg-ui-area dark:hover:bg-ui-area-dark w-[2em] h-[2em] pt-0.5 rounded-md ${k - 1 == curPage && `font-bold`}`}
                                onClick={() => { setCurPage(i) }}>
                                {k}
                            </div>
                        ))}

                    {/** Next Page */}
                    <div className={`${buttonStyle} border-ui-line dark:border-ui-line-dark hover:bg-ui-area dark:hover:bg-ui-area-dark px-3 pt-0.5  ${curPage >= Math.ceil(numTotal / pageMaxNum) - 1 && `opacity-50`}`}
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