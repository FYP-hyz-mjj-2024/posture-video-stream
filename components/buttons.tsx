import { NextRouter } from "next/router";
import { IconType } from "react-icons";

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