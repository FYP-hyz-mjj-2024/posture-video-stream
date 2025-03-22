"use client";
// Basic
import { useRef, useEffect, useState } from "react";
import { NextRouter } from "next/router";
import Image from "next/image";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { IconType } from "react-icons";
import { FaMagnifyingGlass, FaCircleXmark } from 'react-icons/fa6';

// Local
import { handleFileInputClick, handleFileInputDrop } from "@/lib/files";
import { useDebounce } from "@/lib/utils";
import { _getErrorMessage, findFaces } from "@/lib/server";
import { checkFileTypeFromBase64 } from "@/lib/files";

/**
 * Image uploader that supports click and drag-and-drop (based on react-hook-form).
 * @param props.EmptyIcon The icon to display when no input is given.
 * @param props.EmptyDesc The description to display when no input is given.
 * @param props.formProps.imageInputRef The ref element defined at the mother component.
 * @param props.formProps.watchField The property name in the form to watch.
 * @param props.formProps.setValue The setValue object defined at the mother component.
 * @param props.formProps.watch The watch object defined at the mother component.
 * @returns 
 */
export const ImageInput = (props: {
    EmptyIcon: IconType,
    EmptyDesc: string,
    formProps: {
        imageInputRef: React.RefObject<HTMLInputElement>,
        watchField: string,
        setValue: UseFormSetValue<any>,
        watch: UseFormWatch<any>,
    }
}) => {
    const { EmptyIcon, EmptyDesc, formProps } = props;
    const { imageInputRef, watchField, setValue, watch } = formProps;

    return (
        <div
            className={`flex flex-row w-full border bg-gray-200 dark:bg-gray-800 
                h-64 items-center justify-center rounded-lg hover:opacity-80`}
            onDrop={(event) => {
                handleFileInputDrop(event, (blob) => {
                    setValue(watchField, blob);
                })
            }}
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
                onChangeCapture={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleFileInputClick(event, (blob) => {
                        setValue(watchField, blob);
                    })
                }} />

            {/** Image Preview */}
            {watch(watchField) ? (
                <Image
                    className={`rounded-lg w-48 h-48 object-cover`}
                    src={watch(watchField)}
                    alt={`Preview`}
                    width={200}
                    height={200} />
            ) : (
                <div className={`flex flex-col items-center`}>
                    <EmptyIcon className={`w-12 h-12 opacity-50`} />
                    <p className={`opacity-50 text-sm`}>{EmptyDesc}</p>
                </div>
            )}
        </div>
    );
}

/**
 * The real-time search bar that searches faces.
 * @param props 
 * @returns 
 */
export const FaceSearchBar = (props: { router: NextRouter }) => {
    const { router } = props;
    const [isActive, setIsActive] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<"Search Faces!" | "Loading..." | "No result." | null>("Search Faces!");
    const [faces, setFaces] = useState<Face[] | []>([]);

    const d_findFace = useDebounce(findFaces, 500);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const restore = () => {
        setIsActive(false);
        if (textareaRef.current) {
            textareaRef.current.value = "";
        }
        setFaces([]);
        setPrompt("Search Faces!");
    }


    // Use ESC key to cancel search.
    useEffect(() => {

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                restore();
            }
        };

        window.addEventListener("keydown", handleEscKey);

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    return (
        <div className={`flex flex-col relative`}>
            <textarea
                ref={textareaRef}
                className={`
                    border border-ui-line dark:border-ui-line-dark 
                    bg-white dark:bg-gray-900
                    rounded-md pt-1.5 pl-9 h-10 resize-none 
                    placeholder:align-middle
                `}
                rows={1}
                placeholder={`Search Face`}
                onFocus={() => { setIsActive(true); }}
                onBlur={() => {
                    restore();
                }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPrompt("Loading...");
                    if (event.target.value == "") {
                        setPrompt("No result.");
                    }
                    d_findFace(
                        {
                            description: event.target.value,
                        } as FacesFindByDescSubmit,
                        {
                            onAuthFailCallback: (e) => {
                                const message = _getErrorMessage(e);
                                window.alert(message);
                                router.push("/");
                            },
                            onSuccessCallback: (response) => {
                                setPrompt(null);
                                setFaces(response.data.faces);
                                console.log(response.data.faces);
                            },
                            onFailCallback: (e) => {
                                setPrompt("No result.");
                            }
                        });
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                }} />

            <FaMagnifyingGlass className={`absolute top-3 left-3 text-gray-400`} />
            {isActive && (
                <FaCircleXmark className={`absolute top-3 right-3 text-gray-400`} />
            )}

            {isActive && (
                <div className={`
                    absolute top-11 right-0 w-96 p-2 rounded-md 
                    border border-ui-line dark:border-ui-line-dark
                    bg-white dark:bg-ui-area-dark drop-shadow-md
                    flex flex-col gap-2 justify-top
                    max-h-96 overflow-y-scroll
                `}>
                    {prompt || !faces ? (
                        <div className={`align-top`}>
                            {prompt}
                        </div>) : (
                        faces.map((face, id) => (
                            <div key={id} className={`flex flex-row items-center justify-between`}>
                                <div>
                                    <p className={`font-bold`}>{face.description}</p>
                                    <p className={`text-sm opacity-50`}>{face.id}</p>
                                    <p className={`text-sm opacity-50`}>{face.uploaded_at}</p>
                                </div>
                                <Image
                                    className={`rounded-md w-16 h-16 object-cover`}
                                    src={`data:image/${checkFileTypeFromBase64(face.blob.slice(0, 15))};base64,${face.blob}`}
                                    alt={face.description}
                                    width={70}
                                    height={70} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}