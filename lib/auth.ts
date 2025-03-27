import axios from "axios"
import { NextRouter } from "next/router";

export const permissions = {
    NO_PERMISSIONS: 1,
    READ: 1 << 0,
    WRITE: 1 << 1,
    DELETE: 1 << 2,
    UPDATE: 1 << 3,
    RESERVE_1: 1 << 4,
    RESERVE_2: 1 << 5,
    DELETE_USERS: 1 << 6,
    GRANT_PERMISSION: 1 << 7,
};

/**
 * User Log out.
 * @param router NextRouter object.
 */
export async function logOut(router: NextRouter) {
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    router.reload();
}

/**
 * Get user data using authentication detials: user_id and token.
 * @param userAuth User authentication details.
 * @returns 
 */
export async function getUser(userAuth: UserAuth) {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/get_user/`,
            userAuth,
        );
        return response.data;
    } catch (e) {
        /**
         * Possible errors:
         * 1. Bad token: Expired or invalid;
         * 2. Server stopped.
         */
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
        return null;
    }

    getUser({ user_id, token }).then((data) => {
        if (!data) {
            router.push("/");
            return;
        }
        localStorage.setItem("user_data", JSON.stringify(data));
    });

}