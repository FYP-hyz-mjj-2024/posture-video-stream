"use client";

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from "next/router";
import Image from "next/image";
import axios from 'axios';

import { guardPage } from '@/lib/auth';
import moment from "moment";

const buttonStyle = `border rounded-md text-center hover:cursor-pointer select-none`;

const inputFieldStyle = `flex flex-row w-84 p-2 rounded-lg border w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
const errorStyle = `flex flex-row h-2 text-red-400 m-0 pl-1 text-sm`

export default function UploadFace() {
    const router = useRouter();

    /**
     * Protected page. Need user authorize.
     */
    useEffect(() => {
        guardPage(router);
    });


    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-10 py-10 rounded-xl gap-10`}>
                <input type={`file`}></input>
                <textarea className={`border border-ui-line resize-none w-[30em]`} />
            </div>
        </main>
    );
}