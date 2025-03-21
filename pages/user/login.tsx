"use client";

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from "next/router";
import axios from 'axios';
import { NavigationButton } from '@/components/buttons';
import { IoAdd } from 'react-icons/io5';

// type UserLoginWithEmail = {
//     email: string,
//     password: string,
// }

// type UserLoginWithName = {
//     name: string,
//     password: string
// }

// type UserLoginSubmit = {
//     email_or_name: string,
//     password: string,
// }


const inputFieldStyle = `flex flex-row w-84 p-2 rounded-lg border w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row h-2 text-red-400 m-0 pl-1 text-sm`

export default function Login() {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<UserLoginSubmit>();
    const [pageError, setPageError] = useState<string | null>(null);

    function submit(userLoginSubmit: UserLoginSubmit) {

        let { email_or_name, password } = userLoginSubmit;

        let userLogin: UserLoginWithEmail | UserLoginWithName = {
            password: password,
            ...(email_or_name.indexOf('@') != -1) ? { email: email_or_name } : { name: email_or_name }
        }

        setPageError(null);

        axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/login/`,
            userLogin,
            { withCredentials: true }
        ).then((response) => {
            let user_id = response.data.user_id;
            let token = response.data.access_token;
            localStorage.setItem("user_id", user_id);
            localStorage.setItem("token", token);
            router.push("/");
        }).catch((e) => {
            setPageError(e.response?.data.detail);
        })
    }

    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 pt-16 pb-10 rounded-xl gap-10`}>
                <div className={`flex flex-col gap-1`}>
                    <p className={`text-3xl font-bold`}>{`Log In`}</p>
                    {pageError ? (<p className={errorStyle}>{pageError}</p>) : (<p className={errorStyle}></p>)}
                </div>

                <form onSubmit={handleSubmit(submit)}>
                    <div className={`flex flex-col gap-3`}>
                        {/** Email or Name Field */}
                        <div className={`flex flex-col gap-1`}>
                            <p className={`text-sm pl-1 font-bold`}>Email or Name</p>

                            <input
                                {...register("email_or_name", {
                                    required: true,
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    },
                                    validate: (value) => {
                                        if (value.indexOf('@') != -1) {
                                            return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) || "Invalid email format."
                                        }

                                        return (value.length < 20 &&
                                            ["admin", "root", "guest", "null", "undefined"].indexOf(value) == -1) || "Don't play tricks.";
                                    }
                                })} placeholder={`Email`} className={inputFieldStyle} />
                            {errors.email_or_name?.message ?
                                (<p className={errorStyle}>{errors.email_or_name.message}</p>) :
                                (<p className={errorStyle}></p>)
                            }
                        </div>

                        {/** Password Field */}
                        <div className={`flex flex-col gap-1`}>
                            <p className={`text-sm pl-1 font-bold`}>Password</p>

                            <input
                                type="password"
                                {...register("password", {
                                    required: true,
                                    minLength: {
                                        value: 6,
                                        message: "Must contain at least 6 characters."
                                    }
                                })}
                                placeholder={`Password`}
                                className={inputFieldStyle} />
                            {errors.password?.message ?
                                (<p className={errorStyle}>{errors.password.message}</p>) :
                                (<p className={errorStyle}></p>)
                            }
                        </div>
                    </div>

                    {/** Submit Button */}
                    <input type="submit"
                        className={`flex flex-rowhover:cursor-pointer hover:opacity-80 
                            bg-black text-white dark:bg-white dark:text-black
                            px-7 py-2 rounded-lg mt-5`}
                        value={`Login`} />

                    {/** To Register */}
                    <div
                        className={`flex flex-row text-align-center items-center justify-center gap-2 mt-8 text-sm opacity-50 hover:cursor-pointer`}
                        onClick={() => { router.push("./register"); }}>
                        <p>{`Don't have an account? Register!`}</p>
                    </div>
                </form>
            </div>
        </main>
    );
}