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
import { useDebounce } from '@/lib/utils';
import { _getErrorMessage, uploadFace } from '@/lib/server';

const inputFieldStyle = `flex flex-row p-2 rounded-lg border w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row h-2 text-red-400 m-0 pl-1 text-sm`

export default function UploadFace() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<FaceUploadSubmit>();
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Debounce with 5 ms delay.
    const d_uploadFace = useDebounce(uploadFace, 500);

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
                d_uploadFace(data, {
                    onAuthFailCallback: () => {
                        setIsLoading(false);
                        alert("Your login info is expired. Please re-login.");
                        router.push("/");
                    },
                    onSuccessCallback: (response) => {
                        setIsLoading(false);
                        router.push("./manage_faces");
                    },
                    onFailCallback: (e) => {
                        setIsLoading(false);
                        const message = _getErrorMessage(e);
                        window.alert(message);
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
                            <p>{`Upload an image`}</p>
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
                        <p className={`text-sm pl-1 font-bold`}>Face Description</p>
                        <textarea
                            className={`${inputFieldStyle} resize-none `}
                            {...register("description", {
                                required: true,
                                maxLength: {
                                    value: 256,
                                    message: "Max description length is 256 characters.",
                                },
                                minLength: {
                                    value: 2,
                                    message: "Description should at least contain 2 characters."
                                }
                            })}
                            placeholder={`Describe this face. e.g., Name, features, etc.`} />

                        {errors.description?.message ?
                            (<p className={errorStyle}>{errors.description.message}</p>) :
                            (<p className={errorStyle}></p>)
                        }
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
                            value={`Upload`} />
                    )}

                </div>
            </form>
        </main>
    );
}