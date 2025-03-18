"use client";

// Package
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from "next/router";
import axios from 'axios';
import { IoIosPersonAdd } from "react-icons/io";

// Local
import { guardPage } from '@/lib/auth';
import { NavigationButton } from '@/components/buttons';
import { IoMdArrowBack } from 'react-icons/io';
import { ImageInput } from '@/components/Inputs';
import { debounce } from '@/lib/utils';
import { compareFace } from '@/lib/server';

export default function CompareFace() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<FaceCompareSubmit>();
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [faceCompareResults, setFaceCompareResults] = useState<FaceCompareResult[]>([]);

    // Debounce with 5 ms delay.
    const d_compareFace = debounce(compareFace, 500);

    /**
     * Protected page. Need user authorize.
     */
    useEffect(() => {
        guardPage(router);
    });


    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <form onSubmit={handleSubmit((data) => {
                setIsLoading(true);
                setFaceCompareResults([]);
                d_compareFace(data, {
                    onAuthFailCallback: () => {
                        setIsLoading(false);
                        alert("Your login info is expired. Please re-login.");
                        router.push("/");
                    },
                    onSuccessCallback: (response) => {
                        setIsLoading(false);
                        const _faceCompareResults: FaceCompareResults = response.data;
                        setFaceCompareResults(_faceCompareResults.desc_scores.slice(0, 2));
                    },
                    onFailCallback: (e) => {
                        setIsLoading(false);
                        window.alert(e.response?.data.detail);
                    },
                });
            })}>

                {/** Panel */}
                <div className={`flex flex-col max-w-[40em] px-10 py-10 rounded-xl gap-10 items-center bg-white dark:bg-gray-900`}>

                    {/** Title Bar */}
                    <div className={`flex flex-col gap-2 items-start w-full`}>
                        {/** Navigation Back */}
                        <NavigationButton
                            to={"./manage_faces"}
                            text={`Face Management Panel`}
                            router={router}
                            Icon={IoMdArrowBack} />

                        {/** Title */}
                        <div className={`flex flex-row text-xl font-bold`}>
                            <p>{`Compare Face`}</p>
                        </div>
                    </div>

                    {/** Image upload element and description. */}
                    <div className={`flex flex-col gap-2 items-center`}>

                        <ImageInput
                            EmptyIcon={IoIosPersonAdd}
                            EmptyDesc={`Supported Format: jpg/jpeg, png.`}
                            formProps={{
                                imageInputRef: imageInputRef,
                                watchField: "blob",
                                setValue: setValue,
                                watch: watch,
                            }} />

                        {/** Description */}
                        <div className={`text-sm text-gray-400 opacity-50`}>
                            <p>
                                {`
                                    Upload an image that contains human face. Make sure that a face is included in the image,
                                    other wise the upload will be rejected.
                                `}
                            </p>
                        </div>
                    </div>

                    {/** Description */}
                    <div className={`flex flex-col gap-1 w-full`}>
                        <p className={`text-sm pl-1 font-bold`}>Comparasion Result</p>
                        <div>
                            {
                                faceCompareResults.map((result, i) => (
                                    <div key={i} className={
                                        `flex flex-row border border-ui-line 
                                    dark:border-ui-line-dark px-4 py-3 justify-between
                                    ${i == 0 && `rounded-tl-lg rounded-tr-lg`} 
                                    ${i == faceCompareResults.length - 1 && `rounded-bl-lg rounded-br-lg`}`}>

                                        {/** Face description and ID */}
                                        <div>
                                            <div className={`font-bold`}>
                                                {result.description}
                                            </div>
                                            <div className={`text-sm opacity-60 max-lg:hidden`}>
                                                {result.score}
                                            </div>
                                        </div>

                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {isLoading ? (
                        <div>
                            <p>{`Loading`}</p>
                        </div>
                    ) : (
                        <input
                            type={`submit`}
                            className={`
                            flex flex-row hover:cursor-pointer hover:opacity-80 
                            bg-black text-white dark:bg-white dark:text-black
                            px-7 py-2 rounded-lg`}
                            value={`Compare`} />
                    )}

                </div>
            </form>
        </main>
    );
}