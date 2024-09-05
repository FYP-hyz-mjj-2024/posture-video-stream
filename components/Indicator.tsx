import React from 'react';

const Indicator = (props: { ws_code: "Connected" | "Closed" | "Error" }) => {
    const ws_code = props.ws_code;
    return (
        <React.Fragment>
            {ws_code == 'Connected' && (
                <div className={`w-2 h-2 border border-white rounded-full bg-[#00FF00]`} />
            )}
            {ws_code == 'Error' && (
                <div className={`w-2 h-2 border border-white rounded-full bg-[#FF0000]`} />
            )}
            {ws_code == 'Closed' && (
                <div className={`w-2 h-2 border border-white rounded-full bg-[#00000000]`} />
            )}
        </React.Fragment>
    )
}

export default Indicator;