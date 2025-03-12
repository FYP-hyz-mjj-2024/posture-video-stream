import Image from "next/image";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { IconType } from "react-icons";
import { handleFileInputClick, handleFileInputDrop } from "@/lib/files";

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