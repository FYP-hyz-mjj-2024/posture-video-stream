"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useDebounce } from "@/lib/utils";
import moment from "moment";
import { IoMdTrash } from "react-icons/io";
import { AiFillEdit, } from "react-icons/ai";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { useRouter } from "next/router";
import { set, useForm } from "react-hook-form";

import { permissions } from "@/lib/auth";
import { _getErrorMessage, deleteFace, editPermission, updateFace, verifyEmailSuper } from "@/lib/server";
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

export const UserItem = (props: { arrId: number, user: UserSuper, users: UserSuper[], }) => {
    const router = useRouter();
    const { arrId, user: user, users } = props;

    const d_verifyEmailSuper = useDebounce(verifyEmailSuper, 500);
    const d_editPermission = useDebounce(editPermission, 500);

    const userPermissionsBinary = user.permissions.toString(2).padStart(8, "0");
    const permissionsList = Object.entries(permissions).reverse();

    return (
        <div className={
            `flex flex-row border-x border-b border-ui-line 
            dark:border-ui-line-dark px-4 py-3 justify-between
            ${arrId == users.length - 1 && `rounded-bl-lg rounded-br-lg`}`}>

            {/** Face description and ID */}
            <div>
                <div className={`font-bold`}>
                    {user.name}
                </div>
                <div className={`text-sm max-lg:hidden text-gray-400`}>
                    {user.user_id}
                </div>
                <div className={`text-sm text-gray-400`}>
                    {moment(user.created_at).format("YYYY-MM-DD HH:mm:ss Z")}
                </div>
            </div>

            <div className={`flex flex-col items-end justify-center`}>
                <div className={`flex flex-row items-center justify-center gap-2`}>
                    <div className={`flex flex-row items-left opacity-50`}>
                        <span className={`align-baseline`}>{`Verified: `}</span>
                    </div>
                    <div className={`flex flex-row items-center justify-center`}>
                        {user.is_verified ? (
                            <FaCheck className={`text-green-500`} />
                        ) : (
                            <FaXmark className={`text-red-500 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700`}
                                onClick={() => {
                                    // console.log(user.user_id);
                                    d_verifyEmailSuper(user.user_id, {
                                        onAuthFailCallback: (e) => {
                                            const message = _getErrorMessage(e);
                                            window.alert(message);
                                            router.push("/");
                                        },
                                        onSuccessCallback: (response) => {
                                            router.reload();
                                        },
                                        onFailCallback: (e) => {
                                            const message = _getErrorMessage(e);
                                            window.alert(message);
                                        }
                                    });
                                }} />
                        )}
                    </div>
                </div>

                <div className={`flex flex-row gap-2`}>
                    {userPermissionsBinary.split("").map((bit, id) => (
                        <div
                            key={id}
                            className={`
                                hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                                rounded-lg px-1 py-1 transition-all`}
                            onClick={() => {
                                const permissionInt = Number(permissionsList[id][1]);
                                const grant = !Boolean(Number(bit));
                                d_editPermission(
                                    user.user_id,
                                    permissionInt,
                                    grant,
                                    {
                                        onAuthFailCallback: (e) => {
                                            const message = _getErrorMessage(e);
                                            window.alert(message);
                                            router.push("/");
                                        },
                                        onSuccessCallback: (response) => {
                                            router.reload();
                                        },
                                        onFailCallback: (e) => {
                                            const message = _getErrorMessage(e);
                                            window.alert(message);
                                        }
                                    })
                            }}>
                            <span className={`${!Boolean(Number(bit)) && `opacity-50`}`}>{permissionsList[id][0]}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}