"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useDebounce } from "@/lib/utils";
import moment from "moment";
import { IoMdTrash } from "react-icons/io";
import { AiFillEdit } from "react-icons/ai";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { _getErrorMessage, deleteFace, updateFace } from "@/lib/server";
import { checkFileTypeFromBase64 } from "@/lib/files";

export const FaceItem = (props: { arrId: number, face: Face, faces: Face[], }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const { arrId, face, faces } = props;
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FaceUpdate>({
        defaultValues: {
            face_id: face.id,
            description: face.description,
        }
    });

    // Debounce with 5 ms delay.
    const d_deleteFace = useDebounce(deleteFace, 500);
    const d_updateFace = useDebounce(updateFace, 500);

    /**
     * Very important!!!!!
     * Here, we need to reset the form when the page changes.
     * Otherwise we can only edit the faces in the first page.
     */
    useEffect(() => {
        reset({
            face_id: face.id,
            description: face.description,
        });
    }, [face, reset]);

    return (
        <form onSubmit={handleSubmit((data) => {
            setIsEditing(false);
            d_updateFace(data, {
                onAuthFailCallback: (e) => {
                    const message = _getErrorMessage(e);
                    window.alert(message);
                    router.push("/");
                },
                onSuccessCallback: (response) => { router.reload(); },
                onFailCallback: (e) => {
                    const message = _getErrorMessage(e);
                    window.alert(message);
                }
            });
        })}>
            <div className={
                `flex flex-row border-x border-b border-ui-line 
        dark:border-ui-line-dark px-4 py-3 justify-between
        ${arrId == faces.length - 1 && `rounded-bl-lg rounded-br-lg`}`}>

                {/** Face description and ID */}
                <div>
                    {isEditing ? (
                        <div>
                            <input type="hidden" {...register("face_id")} />
                            <textarea
                                className={`h-[1.2em] resize-none bg-white dark:bg-ui-area-dark`}
                                {...register("description")}>
                            </textarea>
                        </div>
                    ) : (
                        <div className={`font-bold`}>
                            {face.description}
                        </div>
                    )}
                    <div className={`text-sm max-lg:hidden text-gray-400`}>
                        {face.id}
                    </div>
                    <div className={`text-sm text-gray-400`}>
                        {moment(face.uploaded_at).format("YYYY-MM-DD HH:mm:ss Z")}
                    </div>
                </div>

                {/** Editing tools and Face Image */}
                <div className={`flex flex-row items-center gap-4`}>
                    {/** Update Button */}
                    {isEditing ? (
                        <div className={`flex flex-row items-center gap-2`}>
                            <input type="submit" value="Update" className={`font-bold`} />
                            <div onClick={() => {
                                setIsEditing(false);
                            }}>
                                Cancel
                            </div>
                        </div>
                    ) : (
                        <div className={`flex flex-row items-center justify-center w-[2em] h-[2em] 
                        opacity-20 hover:opacity-100 rounded-full hover:cursor-pointer 
                        hover:bg-black hover:text-white transition-all`}
                            onClick={() => {
                                setIsEditing(true);
                            }}>
                            <AiFillEdit />
                        </div>
                    )}

                    {/** Delete Button */}
                    <div className={`flex flex-row items-center justify-center w-[2em] h-[2em] 
                             opacity-20 hover:opacity-100 rounded-full hover:cursor-pointer 
                             hover:bg-black hover:text-white transition-all`}
                        onClick={() => {
                            if (!window.confirm(`Are you sure to delete ${face.id}?`)) {
                                return;
                            }
                            d_deleteFace(face.id,
                                {
                                    onAuthFailCallback: (e) => {
                                        const message = _getErrorMessage(e);
                                        window.alert(message);
                                        router.push("/");
                                    },
                                    onSuccessCallback: (response) => { router.reload(); },
                                    onFailCallback: (e) => {
                                        const message = _getErrorMessage(e);
                                        window.alert(message);
                                    }
                                }
                            );
                        }}>
                        <IoMdTrash />
                    </div>

                    {/** Image */}
                    <Image
                        className={`rounded-lg w-16 h-16 object-cover`}
                        src={`data:image/${checkFileTypeFromBase64(face.blob.slice(0, 15))};base64,${face.blob}`}
                        alt={face.description}
                        width={70}
                        height={70} />
                </div>
            </div>
        </form>
    );
}