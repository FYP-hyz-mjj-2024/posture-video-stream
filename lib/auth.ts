import axios from "axios"

/**
   * Get user data using authentication detials: user_id and token.
   * @param userAuth User authentication details.
   * @returns 
   */
export async function getUser(userAuth: UserAuth) {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/get_user`,
            userAuth,
        );
        return response.data;
    } catch (e) {
        /**
         * Possible errors:
         * 1. Bad token: Expired or invalid;
         * 2. Server stopped.
         */
        console.log(e);
        return null;
    }
}