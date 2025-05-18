"use client"
// Site Packages
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import moment from "moment";

// UI
import { AiFillEdit, } from "react-icons/ai";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { IoMdTrash, IoMdKey } from "react-icons/io";

// Locals
import { useDebounce } from "@/lib/utils";
import { permissionNames, permissions } from "@/lib/auth";
import { getErrorMessage, deleteFace, editPermission, updateFace, verifyEmailSuper, changePassword } from "@/lib/server";
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
                onAuthFail: (e) => {
                    const message = getErrorMessage(e);
                    window.alert(message);
                    router.push("/");
                },
                onSuccess: (response) => { router.reload(); },
                onFail: (e) => {
                    const message = getErrorMessage(e);
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
                            d_deleteFace(
                                {
                                    face_id: face.id
                                },
                                {
                                    onAuthFail: (e) => {
                                        const message = getErrorMessage(e);
                                        window.alert(message);
                                        router.push("/");
                                    },
                                    onSuccess: (response) => { router.reload(); },
                                    onFail: (e) => {
                                        const message = getErrorMessage(e);
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
    const permissionNamesList = Object.entries(permissionNames).reverse();

    const [isShowPasswordChange, setIsShowPasswordChange] = useState<boolean>(false);

    const { register, setValue, handleSubmit, watch, formState: { errors } } = useForm<PasswordChangeSubmit>();

    return (
        <div className={
            `flex flex-row border-x border-b border-ui-line 
            dark:border-ui-line-dark px-4 py-3 justify-between
            ${arrId == users.length - 1 && `rounded-bl-lg rounded-br-lg`}`}>
            {/** User description and ID */}
            <div>
                <div className={`flex flex-row gap-2 items-center justify-start`}>
                    <div className={`font-bold`}>
                        {user.name}
                    </div>
                    {/** Change Password Field */}
                    {isShowPasswordChange ? (
                        <form onSubmit={handleSubmit((data) => {
                            if (data.new_password == "") {
                                window.alert("Password should not be empty.");
                                return;
                            }
                            const thisUserId = Cookies.get("user_id");
                            if (thisUserId == user.user_id &&
                                !window.confirm(
                                    "Are you sure you want to change your own password? You will be un-verified and need to seek other superuser's verification."
                                )
                            ) {
                                return;
                            }
                            changePassword(data, {
                                onSuccess: (response) => {
                                    router.reload();
                                },
                                onAuthFail: (e) => {
                                    const message = getErrorMessage(e);
                                    window.alert(message);
                                    router.push("/");
                                },
                                onFail: (e) => {
                                    const message = getErrorMessage(e);
                                    window.alert(message);
                                }
                            })
                        })}
                            className={`flex flex-row w-full`}>
                            <div className={`flex flex-row items-center justify-between w-full gap-2`}>
                                <input type={`hidden`} value={user.user_id} {...register("requester_user_id")} />
                                <input
                                    type="text"
                                    className={`flex flex-row border border-black border-lg rounded-md
                                        text-sm text-gray-400 max-h-5 max-w-32 px-2
                                        overflow-hidden`}
                                    {...register("new_password", {
                                        required: true,
                                        minLength: {
                                            value: 6,
                                            message: "New password must contain at least 6 characters."
                                        }
                                    })}
                                    placeholder={`New Password`} />
                                <input type={`submit`} className={`whitespace-nowrap`} value={`Change`} />
                                <div 
                                    className={`opacity-50 hover:cursor-pointer select-none`} 
                                    onClick={() => { setIsShowPasswordChange(false); }}>{`Cancel`}</div>
                            </div>
                        </form>
                    ) : (
                        <div
                            className={`hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                                rounded-lg px-1 py-1 transition-all`} 
                            onClick={() => { setIsShowPasswordChange(true); }}>
                            <IoMdKey />
                        </div>
                    )}
                </div>

                <div className={`text-sm max-lg:hidden text-gray-400 max-h-5 overflow-hidden`}>
                    {user.user_id}
                </div>
                <div className={`text-sm text-gray-400 max-h-5 overflow-hidden`}>
                    {moment(user.created_at).format("YYYY-MM-DD HH:mm:ss Z")}
                </div>

                {/** Change Password Error */}
                <div className="text-red-500">{errors.new_password?.message}</div>
            </div>

            {/** Verification status, permissions, etc. */}
            <div className={`flex flex-col items-end justify-center`}>
                {/** Email, Verification */}
                <div className={`flex flex-row items-center justify-center gap-2`}>
                    {/** User Email */}
                    <div className={`flex flex-row items-left gap-2`}>
                        <span className={`align-baseline text-gray-300 dark:text-gray-400`}>
                            {user.email}
                        </span>
                        <span className={`align-baseline text-gray-300 dark:text-gray-400`}>
                            {`Verified: `}
                        </span>
                    </div>

                    {/** User verification mark. */}
                    <div className={`flex flex-row items-center justify-center`}>
                        {user.is_verified ? (
                            <FaCheck className={`text-green-500`} />
                        ) : (
                            <FaXmark className={`text-red-500 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700`}
                                onClick={() => {
                                    // console.log(user.user_id);
                                    d_verifyEmailSuper({
                                        verify_user_id: user.user_id
                                    }, {
                                        onAuthFail: (e) => {
                                            const message = getErrorMessage(e);
                                            window.alert(message);
                                            router.push("/");
                                        },
                                        onSuccess: (response) => {
                                            router.reload();
                                        },
                                        onFail: (e) => {
                                            const message = getErrorMessage(e);
                                            window.alert(message);
                                        }
                                    });
                                }} />
                        )}
                    </div>
                </div>
                {/** User Permission Row */}
                <div className={`flex flex-row gap-2 max-sm:hidden`}>
                    {userPermissionsBinary.split("").map((bit, id) => (
                        <div
                            key={id}
                            className={`
                                hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                                rounded-lg px-1 py-1 transition-all`}
                            onClick={() => {
                                const thisUserId = Cookies.get("user_id");
                                if (thisUserId == user.user_id &&
                                    !window.confirm(
                                        "Are you sure you want to revoke this permission for yourself? This operation is very dangerous and can't be revoked."
                                    )
                                ) {
                                    return;
                                }
                                const permissionInt = Number(permissionsList[id][1]);
                                const grant = !Boolean(Number(bit));
                                d_editPermission(
                                    {
                                        requester_user_id: user.user_id,
                                        permission: permissionInt,
                                        grant: grant,
                                    },
                                    {
                                        onAuthFail: (e) => {
                                            const message = getErrorMessage(e);
                                            window.alert(message);
                                            router.push("/");
                                        },
                                        onSuccess: (response) => {
                                            router.reload();
                                        },
                                        onFail: (e) => {
                                            const message = getErrorMessage(e);
                                            window.alert(message);
                                        }
                                    })
                            }}>
                            <span className={
                                `${!Boolean(Number(bit)) && `text-gray-300 dark:text-gray-500`}`
                            }>{permissionNamesList[id][1]}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}