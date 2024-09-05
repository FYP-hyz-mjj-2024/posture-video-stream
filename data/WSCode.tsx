const codes = {
    Connected: {
        "Prompt": "Connection Established.",
        "Color": "#00FF00",
        "VideoPrompt": "The connection is established, but there is no video source."
    },
    Closed: {
        "Prompt": "Connection Closed. Try re-freshing to re-connect.",
        "Color": "#000000DD",
        "VideoPrompt": "The connection is closed, therefore we can't receive any video source."
    },
    Error: {
        "Prompt": "Error Occurred. Please refresh.",
        "Color": "#FF0000",
        "VideoPrompt": "There is an error in the connection."
    }
}

export default codes;