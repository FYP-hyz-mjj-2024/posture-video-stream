"use client";

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from "next/router";
import Image from "next/image";
import axios from 'axios';
import { IoIosPersonAdd } from "react-icons/io";

import { guardPage } from '@/lib/auth';

const inputFieldStyle = `flex flex-row w-84 p-2 rounded-lg border w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row h-2 text-red-400 m-0 pl-1 text-sm`

export default function UploadFace() {
    const router = useRouter();
    const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<FaceUploadSubmit>();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 200 * 1024 * 1024;    // 200 MB

    /**
     * Convert a file's binary part into base64.
     * @param file File object.
     * @returns 
     */
    function _fileToBase64(file: File, keepHeader = false): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (!reader.result) {
                    return null;
                }
                const result = reader.result as string;
                if (keepHeader) {
                    resolve(result);
                } else {
                    resolve(result.split(',')[1]);
                }
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Receiving a fileList from browser, get the target file's base64.
     * @param _fileList 
     * @returns 
     */
    async function pruneFileList(_fileList: FileList): Promise<string | null> {
        // Invalid FileList length.
        if (!_fileList || _fileList.length <= 0) {
            alert("Invalid file.");
            return null;
        }

        const fileList = Array.from(_fileList);

        // Can only upload one face at a time.
        if (fileList.length > 1) {
            alert("Only one file is allowed.");
            return null;
        } else if (fileList.length <= 0) {
            alert("Internal Error: File list is empty.");
            return null;
        }

        // Remove the "list" dimension.
        const file = fileList[0];

        // Check file size.
        if (file.size > MAX_FILE_SIZE) {
            alert(`Your file has size of ${Math.ceil(file.size / (1024 * 1024))} MB, 
                   while the maximum allowed is ${Math.ceil(MAX_FILE_SIZE / (1024 * 1024))}.`);
            return null;
        }

        // Keep the headers now as data URL.
        const blob = await _fileToBase64(file, true);
        return blob
    }

    /**
     * Handle drop to upload file.
     * @param event HTML div element drag event.
     * @returns 
     */
    async function handleFileInputDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        const droppedFileList: FileList = event.dataTransfer.files;
        const blob = await pruneFileList(droppedFileList);

        if (blob) {
            setValue("blob", blob);
        }
    }

    /**
     * Handle click to upload file.
     * @param event HTML input element change event.
     * @returns 
     */
    async function handleFileInputClick(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFileList: FileList | null = event.target.files;
        if (!selectedFileList) {
            return;
        }

        const blob = await pruneFileList(selectedFileList);

        if (blob) {
            setValue("blob", blob);
        }
    }

    /**
     * Upload the selected face.
     * @param faceUploadSubmit Face upload submit data.
     * @returns 
     */
    async function upload(faceUploadSubmit: FaceUploadSubmit) {
        const user_id = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!user_id || !token) {
            alert("Your login info is expired. Please re-login.");
            router.push("/");
            return;
        }

        // Remove the header of the base64 string.
        const blob = faceUploadSubmit.blob.split(",")[1];

        const faceUpload: FaceUpload = {
            user_id: user_id,
            token: token,
            blob: blob,
            description: faceUploadSubmit.description
        };

        // Upload.
        axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/upload_face`,
            faceUpload
        ).then((response) => {
            router.push("./manage_faces");
        }).catch((e) => {
            window.alert(e.response?.data.detail);
        });

        console.log(blob);
    }

    /**
     * Protected page. Need user authorize.
     */
    useEffect(() => {
        guardPage(router);
    });


    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <form onSubmit={handleSubmit(upload)}>
                <div className={`flex flex-col bg-white dark:bg-gray-900 px-10 py-10 rounded-xl gap-10`}>
                    {/** Image upload element. Outline div frame. */}
                    <div
                        className={`flex flex-row border bg-gray-200 dark:bg-gray-800 
                                    h-64 items-center justify-center rounded-lg hover:opacity-80`}
                        onDrop={handleFileInputDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={(e) => {
                            imageInputRef.current?.click();
                        }}>

                        {/** Clickable Input Element */}
                        <input
                            hidden
                            ref={imageInputRef}
                            type={`file`}
                            accept='image/jpeg, image/jpg, image/png'
                            multiple={false}
                            onChangeCapture={handleFileInputClick} />

                        {/** Image Preview */}
                        {watch("blob") ? (
                            <Image
                                className={`rounded-lg w-48 h-48 object-cover`}
                                src={watch("blob")}
                                alt={`Preview`}
                                width={200}
                                height={200} />
                        ) : (
                            <IoIosPersonAdd className={`w-12 h-12 opacity-50`} />
                        )}
                    </div>

                    {/** Description */}
                    <div className={`flex flex-col gap-1`}>
                        <p className={`text-sm pl-1 font-bold`}>Face Description</p>
                        <textarea
                            className={`${inputFieldStyle} resize-none w-[30em]`}
                            {...register("description")} />

                        {errors.description?.message ?
                            (<p className={errorStyle}>{errors.description.message}</p>) :
                            (<p className={errorStyle}></p>)
                        }
                    </div>

                    <input type={`submit`} className={`flex flex-rowhover:cursor-pointer hover:opacity-80 
                            bg-black text-white dark:bg-white dark:text-black
                            px-7 py-2 rounded-lg`} />

                </div>
            </form>
        </main>
    );
}