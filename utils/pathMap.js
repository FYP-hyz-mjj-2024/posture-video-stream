export const BASE_URI = "ws://152.42.198.96:8976"
export const BASE_URI_LOCAL = "ws://localhost:8976"
export const WS_URL = process.env.NODE_ENV == "production" ? BASE_URI : BASE_URI_LOCAL;