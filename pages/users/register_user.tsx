"use client";

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';

import useAuthStore from './userAuthStore';

type UserRegister = {
    email: string;
    name: string;
    password: string;
}

type UserRegisterSubmit = UserRegister & { passwordConfirm: string };


function submit(userRegisterSubmit: UserRegisterSubmit) {

    let { email, name, password } = userRegisterSubmit;

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/register`,
        {
            email: email,
            name: name,
            password: password
        }
    ).then((response) => {
        let user_id = response.data.user_id;
        let token = response.data.token;
        // useAuthStore((state) => {
        //     state.setAuth(user_id, token);
        // })

    }).catch((e) => {

    })
}


const inputFieldStyle = `flex flex-row w-full p-2 rounded-lg border w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row w-full text-red-400 m-0 pl-1 text-sm`

export default function login_signup() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<UserRegisterSubmit>();

    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 py-16 rounded-xl gap-10`}>
                <div className={`flex flex-row`}>
                    <p className={`text-3xl font-bold`}>Sign Up</p>
                </div>
                {/* 
                <div onClick={() => {

                    console.log(`${user_id} -`)
                }}>Test</div> */}

                <form onSubmit={handleSubmit(submit)}>
                    <div className={`flex flex-row gap-7`}>
                        <div className={`flex flex-col gap-3`}>
                            {/** Email Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Email</p>
                                {errors.email?.message && (<p className={errorStyle}>{errors.email.message}</p>)}
                                <input
                                    {...register("email", {
                                        required: true,
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address format."
                                        }
                                    })} placeholder={`Email`} className={inputFieldStyle} />
                            </div>

                            {/** Name Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Name</p>
                                {errors.name?.message && (<p className={errorStyle}>{errors.name.message}</p>)}
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
                            </div>
                        </div>

                        <div className={`flex flex-col gap-3`}>
                            {/** Password Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Password</p>
                                {errors.password?.message && (<p className={errorStyle}>{errors.password.message}</p>)}
                                <input
                                    {...register("password", {
                                        required: true,
                                        minLength: {
                                            value: 6,
                                            message: "Must contain at least 6 characters."
                                        }
                                    })}
                                    placeholder={`Password`}
                                    className={inputFieldStyle} />
                            </div>

                            {/** Password Confirm Field */}
                            <div className={`flex flex-col gap-1`}>
                                <p className={`text-sm pl-1 font-bold`}>Password Confirm</p>
                                {errors.passwordConfirm?.message && (<p className={errorStyle}>{errors.passwordConfirm.message}</p>)}
                                <input
                                    {...register("passwordConfirm", {
                                        required: true,
                                        validate: (value) => value == watch("password") || "Passwords do not match."
                                    })}
                                    placeholder={`Password Confirm`}
                                    className={inputFieldStyle} />
                            </div>

                        </div>
                    </div>

                    {/** Submit Button */}
                    <input type="submit" className={`flex flex-rowhover:cursor-pointer hover:opacity-80 
                            bg-black text-white dark:bg-white dark:text-black
                            px-7 py-2 rounded-lg mt-5`} />
                </form>
            </div>
        </main>
    );
}