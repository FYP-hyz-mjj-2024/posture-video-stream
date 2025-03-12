import { NextRouter } from "next/router";
import { IconType } from "react-icons";

/**
 * Navigation button.
 * @param props 
 * @returns 
 */
export const NavigationButton = (props: { to: string, text: string, router: NextRouter, Icon: IconType }) => {
    const { to, text, router, Icon } = props;
    return (
        <div className={`flex flex-row`} onClick={() => { router.push(to); }}>
            <div className={`flex flex-row font-bold items-center align-center gap-2 pl-2 pr-4 py-1 rounded-lg
                            hover:cursor-pointer hover:bg-ui-area dark:hover:bg-ui-area-dark transition-all`}>
                <Icon />
                <p>{text}</p>
            </div>
        </div>
    );
}

export const Button = (props: {
    type: "Regular" | "Emphasize",
    text: string,
    callback: () => void,
    disableWhen: boolean,
    excessStyles: string
}) => {
    const { type, text, callback, disableWhen, excessStyles } = props;
    const baseStyle = `border rounded-md text-center hover:cursor-pointer select-none`;

    let style;
    if (type === "Regular") {
        style = `
            border-ui-line dark:border-ui-line-dark 
            hover:bg-ui-area dark:hover:bg-ui-area-dark px-3 pt-0.5
        `
    } else if (type === "Emphasize") {
        style = `
            flex flex-col border-ui-line-green bg-ui-area-green 
            hover:bg-ui-line-green text-white font-bold items-center justify-center
            `
    } else {
        style = ""
    }

    return (
        <div className={`${baseStyle} ${style} ${excessStyles} ${disableWhen && `opacity-50`}`}
            onClick={() => {
                callback();
            }}>
            <p>{text}</p>
        </div>
    );
};