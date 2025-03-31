"use client";
// Basic
import { useRef, useEffect, useState } from "react";
import { NextRouter } from "next/router";
import Image from "next/image";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { IconType } from "react-icons";
import { FaMagnifyingGlass, FaCircleXmark } from 'react-icons/fa6';
import { AxiosResponse } from "axios";

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
 * Perform blur-searching.
 * @param props 
 * @returns 
 */
export const SearchBar = <TRequestItem, TResultItem,>(props: {
    children: (props: { resultItem: TResultItem, key: number }) => React.ReactNode,
    router: NextRouter,
    searchFunc: (
        submitData: any,
        callbacks: RequestCallbacks<TResultItem>
    ) => void,
    placeholder: string,
}) => {
    const { children, router, searchFunc, placeholder } = props;
    const [isActive, setIsActive] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<"Search!" | "Loading..." | "No result." | null>("Search!");
    const [resultItemList, setResultItemList] = useState<TResultItem[] | []>([]);

    // const d_findFace = useDebounce(findFaces, 500);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const restore = () => {
        setIsActive(false);
        if (textareaRef.current) {
            textareaRef.current.value = "";
        }
        setResultItemList([]);
        setPrompt("Search!");
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
            <FaMagnifyingGlass className={`absolute top-3 left-3 text-gray-400`} />
            {isActive && (
                <FaCircleXmark className={`absolute top-3 right-3 text-gray-400`} />
            )}

            <textarea
                ref={textareaRef}
                className={`
                    border border-ui-line dark:border-ui-line-dark 
                    bg-white dark:bg-gray-900
                    rounded-md pt-1.5 pl-9 h-10 resize-none 
                    placeholder:align-middle
                `}
                rows={1}
                placeholder={placeholder}

                // Control the display of result modal.
                onFocus={() => {
                    setIsActive(true);
                }}
                onBlur={() => {
                    restore();
                }}

                // Request when content changed.
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPrompt("Loading...");
                    if (event.target.value == "") {
                        setPrompt("No result.");
                    }

                    searchFunc(
                        {
                            query: event.target.value,
                        } as TRequestItem,
                        {
                            onAuthFailCallback: (e) => {
                                const message = _getErrorMessage(e);
                                window.alert(message);
                                router.push("/");
                            },
                            onSuccessCallback: (response) => {
                                setPrompt(null);
                                setResultItemList(Object.values(response.data)[0] as TResultItem[]);
                            },
                            onFailCallback: (e) => {
                                setPrompt("No result.");
                            }
                        }
                    );
                }}

                // Does not allow line changing in textarea.
                onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                }} />

            {isActive && (
                <div className={`
                    absolute top-11 right-0 w-96 p-2 rounded-md 
                    border border-ui-line dark:border-ui-line-dark
                    bg-white dark:bg-ui-area-dark drop-shadow-md    
                `}>
                    {prompt || !resultItemList ? (
                        <div className={`align-top`}>
                            {prompt}
                        </div>) : (
                        <div className={`flex flex-col justify-top gap-2 max-h-96 overflow-y-auto`}>
                            {resultItemList.map((item, id) => (
                                children({ resultItem: item, key: id })
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}