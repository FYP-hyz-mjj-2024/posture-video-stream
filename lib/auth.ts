import axios from "axios"
import { NextRouter } from "next/router";

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

/**
 * Guard a protected page.
 * @param router NextRouter object.
 * @returns 
 */
export async function guardPage(router: NextRouter) {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");


    if (!user_id || !token) {
        router.push("/");
        return;
    }

    getUser({ user_id, token }).then((data) => {
        if (!data) {
            router.push("/");
            return;
        }
    });
}