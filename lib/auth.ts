import axios, { AxiosResponse, AxiosError } from "axios"
import Cookies from "js-cookie";
import { NextRouter } from "next/router";

import { _getErrorMessage } from "./server";

export const permissions = {
    // NO_PERMISSIONS: 0,
    READ: 1 << 0,
    WRITE: 1 << 1,
    DELETE: 1 << 2,
    UPDATE: 1 << 3,
    RESERVE_1: 1 << 4,
    RESERVE_2: 1 << 5,
    DELETE_USERS: 1 << 6,
    GRANT_PERMISSION: 1 << 7,
};

export const permissionNames = {
    1: "Read",
    2: "Write",
    4: "Delete",
    8: "Update",
    16: "R1",
    32: "R2",
    64: "Delete Users",
    128: "Grant Permission",
};

/**
 * Get user authorization information.
 * @returns 
 */
export function _getUserAuth() {
    const user_id = Cookies.get("user_id");
    const token = Cookies.get("token");
    return {
        user_id: user_id ? user_id : null,
        token: token ? token : null,
    };
}

/**
 * User Login.
 * @param userLoginSubmit 
 */
export async function login(userLoginSubmit: UserLoginSubmit, callbacks: RequestCallbacks<UserLoginResponse>) {

    let { email_or_name, password } = userLoginSubmit;

    let userLogin: UserLoginWithEmail | UserLoginWithName = {
        password: password,
        ...(email_or_name.indexOf('@') != -1) ? { email: email_or_name } : { name: email_or_name }
    }

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/login/`,
        userLogin,
    ).then((response: AxiosResponse<UserLoginResponse>) => {
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        console.log(e);
        callbacks.onFailCallback(e);
    })
}

/**
 * User Log out.
 * @param router NextRouter object.
 */
export async function logOut(router: NextRouter) {
    // localStorage.removeItem("user_id");
    // localStorage.removeItem("token");
    Cookies.remove("user_id");
    Cookies.remove("token");
    router.reload();
}

/**
 * Get user data using authentication detials: user_id and token.
 * @param userAuth User authentication details.
 * @returns 
 */
export async function getUser(
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<UserBasic>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return null;
    }

    const userAuth: WithUserId = {
        user_id: user_id,
    }

    await axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/get_user/`,
        userAuth,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }
    ).then((response) => {
        if (!response) {
            callbacks.onFailCallback("Response is empty.");
            return null;
        }
        callbacks.onSuccessCallback(response);
    }).catch((e: AxiosError) => {
        callbacks.onFailCallback(e);
    });
}

/**
 * Guard a protected page.
 * @param router NextRouter object.
 * @returns 
 */
export async function guardPage(router: NextRouter) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        router.push("/");
        return null;
    }

    getUser({
        onAuthFailCallback: (e) => {
            const message = _getErrorMessage(e);
            window.alert(message);
            router.push("/");
        },
        onSuccessCallback: (response) => {
            const data: UserBasic = response.data;
            localStorage.setItem("user_data", JSON.stringify(data));
        },
        onFailCallback: (e) => {
            const message = _getErrorMessage(e);
            window.alert(message);
        }
    })

}