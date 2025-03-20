"use client";

import React, { useState } from 'react';
import { useRouter } from "next/router"
import { useForm } from 'react-hook-form';
import axios from 'axios';

const inputFieldStyle = `flex flex-row w-84 p-2 rounded-lg border w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row h-2 text-red-400 m-0 pl-1 text-sm`

export default function Register() {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<UserRegisterSubmit>();
    const [pageError, setPageError] = useState<string | null>(null);

    function submit(userRegisterSubmit: UserRegisterSubmit) {

        let { email, name, password } = userRegisterSubmit;

        setPageError(null);

        axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/register/`,
            {
                email: email,
                name: name,
                password: password
            }
        ).then((response) => {
            let user_id = response.data.user_id;
            let token = response.data.token;
            localStorage.setItem("user_id", user_id);
            localStorage.setItem("token", token);
            router.push("./login")
        }).catch((e) => {
            setPageError(e.response?.data.detail);
        })
    }

    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 pt-16 pb-8 rounded-xl gap-10`}>
                <div className={`flex flex-col gap-1`}>
                    <p className={`text-3xl font-bold`}>Register</p>
                    {pageError ? (<p className={errorStyle}>{pageError}</p>) : (<p className={errorStyle}></p>)}
                </div>

                <form onSubmit={handleSubmit(submit)}>
                    <div className={`flex flex-row gap-7`}>
                        <div className={`flex flex-col gap-3`}>
                            {/** Email Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Email</p>

                                <input
                                    {...register("email", {
                                        required: true,
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address format."
                                        }
                                    })} placeholder={`Email`} className={inputFieldStyle} />
                                {errors.email?.message ?
                                    (<p className={errorStyle}>{errors.email.message}</p>) :
                                    (<p className={errorStyle}></p>)
                                }
                            </div>

                            {/** Name Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Name</p>

                                <input
                                    {...register("name", {
                                        required: true,
                                        minLength: {
                                            value: 3,
                                            message: "Username must be at least 3 characters"
                                        },
                                        maxLength: {
                                            value: 20,
                                            message: "Username must be no more than 20 characters"
                                        },
                                        pattern: {
                                            value: /^[a-zA-Z0-9_-]+$/,
                                            message: "Invalid user name format."
                                        },

                                        validate: (value) => {
                                            return ["admin", "root", "guest", "null", "undefined"].indexOf(value) == -1 || "Don't play tricks.";
                                        }
                                    })} placeholder={`Name`} className={inputFieldStyle} />
                                {errors.name?.message ?
                                    (<p className={errorStyle}>{errors.name.message}</p>) :
                                    (<p className={errorStyle}></p>)
                                }
                            </div>
                        </div>

                        <div className={`flex flex-col gap-3`}>
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

                            {/** Password Confirm Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Password Confirm</p>
                                <input
                                    type="password"
                                    {...register("passwordConfirm", {
                                        required: true,
                                        validate: (value) => value == watch("password") || "Passwords do not match."
                                    })}
                                    placeholder={`Password Confirm`}
                                    className={inputFieldStyle} />

                                {errors.passwordConfirm?.message ?
                                    (<p className={errorStyle}>{errors.passwordConfirm.message}</p>) :
                                    (<p className={errorStyle}></p>)
                                }
                            </div>
                        </div>
                    </div>

                    {/** Submit Button */}
                    <input type="submit"
                        className={`flex flex-rowhover:cursor-pointer hover:opacity-80 
                            bg-black text-white dark:bg-white dark:text-black
                            px-7 py-2 rounded-lg mt-5`}
                        value={`Register`} />

                    {/** To Login */}
                    <div
                        className={`flex flex-row text-align-center items-center justify-center gap-2 mt-8 text-sm opacity-50 hover:cursor-pointer`}
                        onClick={() => { router.push("./login"); }}>
                        <p>Already have an account? Login!</p>
                    </div>
                </form>
            </div>
        </main>
    );
}