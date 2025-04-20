// Site packages
import axios, { AxiosResponse } from "axios"
import Cookies from "js-cookie";
import { NextRouter } from "next/router";

// Locals
import { getErrorMessage, getUser } from "./server";

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
export async function login(
    userLoginSubmit: UserLoginSubmit,
    callbacks: RequestCallbacks<UserLoginResponse>
) {

    let { email_or_name, password } = userLoginSubmit;

    let userLogin: UserLoginWithEmail | UserLoginWithName = {
        password: password,
        ...(email_or_name.indexOf('@') != -1) ? { email: email_or_name } : { name: email_or_name }
    }

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/login/`,
        userLogin,
    ).then((response: AxiosResponse<UserLoginResponse>) => {
        callbacks.onSuccess(response);
    }).catch((e) => {
        console.log(e);
        callbacks.onFail(e);
    })
}

/**
 * User Register
 * @param userRegisterSubmit 
 * @param callbacks 
 */
export async function u_register(
    userRegisterSubmit: UserRegisterSubmit,
    callbacks: RequestCallbacks<any>,
) {
    let { email, name, password } = userRegisterSubmit;

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/register/`,
        {
            email: email,
            name: name,
            password: password
        }
    ).then((response) => {
        if (!response) {
            callbacks.onFail({ localMessage: "Response is empty." });
        }
        callbacks.onSuccess(response);
    }).catch((e) => {
        // setPageError(e.response?.data.detail);
        callbacks.onFail(e);
    })
}

/**
 * User Log out.
 * @param router NextRouter object.
 */
export async function logOut(router: NextRouter) {
    Cookies.remove("user_id");
    Cookies.remove("token");
    router.reload();
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

    getUser({}, {
        onAuthFail: (e) => {
            const message = getErrorMessage(e);
            window.alert(message);
            router.push("/");
        },
        onSuccess: (response) => {
            const data: UserBasic = response.data;
            localStorage.setItem("user_data", JSON.stringify(data));
        },
        onFail: (e) => {
            const message = getErrorMessage(e);
            window.alert(message);
        }
    })

}