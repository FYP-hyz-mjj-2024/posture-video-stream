import { NextRouter } from "next/router";
import { IconType } from "react-icons";

/**
 * Navigation button.
 * @param props 
 * @returns 
 */
export const NavigationButton = (props: {
    to: string,
    text: string,
    router: NextRouter,
    Icon: IconType
}) => {
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
    Icon: IconType | null,
    callback: () => void,
    disableWhen: boolean,
    excessStyles: string
}) => {
    const { type, text, Icon, callback, disableWhen, excessStyles } = props;
    const baseStyle = `border rounded-md flex flex-row gap-1 text-center hover:cursor-pointer select-none`;

    let style;
    switch (type) {
        case "Regular":
            style = `
            items-center justify-center
            border-ui-line dark:border-ui-line-dark 
            hover:bg-ui-area dark:hover:bg-ui-area-dark px-3
        `;
            break;
        case "Emphasize":
            style = `
            items-center justify-center
            border-ui-line-green bg-ui-area-green 
            hover:bg-ui-line-green text-white font-bold 
            `;
            break;
        default:
            style = "";
    }

    return (
        <div className={`${baseStyle} ${style} ${excessStyles} ${disableWhen && `opacity-50`}`}
            onClick={() => {
                if (disableWhen) return;
                callback();
            }}>
            {Icon && (
                <Icon />
            )}
            <span className={`inline-block align-top`}>{text}</span>
        </div>
    );
};