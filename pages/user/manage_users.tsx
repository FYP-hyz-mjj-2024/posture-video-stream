"use client";
// Package
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import axios from 'axios';
import { IoMdArrowBack } from "react-icons/io";

// Local
import { _getUserAuth, guardPage } from '@/lib/auth';
import { NavigationButton, Button } from '@/components/buttons';
import { UserItem } from '@/components/ListItem';
import { SearchBar } from '@/components/Inputs';
import { getUsers, findUsers, _getErrorMessage } from '@/lib/server';
import { useDebounce } from '@/lib/utils';

const buttonStyle = `border rounded-md text-center hover:cursor-pointer select-none`;

export default function ManageUsers() {
    const router = useRouter();

    // Data
    const [userData, setUserData] = useState<UserBasic | null>(null);
    const [users, setUsers] = useState<UserSuper[]>([]);

    // Pagination
    const [numThisPage, setNumThisPage] = useState<number>(0);
    const [numTotal, setNumTotal] = useState<number>(0);
    const [curPage, setCurPage] = useState<number>(0);
    const pageMaxNum = 5;


    /**
     * Protected page. Need user authorize.
     */
    useEffect(() => {
        guardPage(router);
        const userData = localStorage.getItem("user_data");
        if (userData) {
            setUserData(JSON.parse(userData));
        }
    }, [router]);


    /**
     * Retrieve faces.
     */
    useEffect(() => {
        const range_from = curPage * pageMaxNum;
        const range_to = range_from + pageMaxNum - 1;
        getUsers({
            range_from: range_from,
            range_to: range_to
        }, {
            onAuthFailCallback: (e) => {
                const message = _getErrorMessage(e);
                window.alert(message);
                router.push("/");
            },
            onSuccessCallback: (response) => {
                const data: UsersGetResult = response.data;
                setNumTotal(data.num_total);
                setNumThisPage(data.num_this_page);
                setUsers(data.users);
            },
            onFailCallback: (e) => {
                const message = _getErrorMessage(e);
                window.alert(message);
            }
        });
    }, [curPage]);


    return (
        <main className={`flex flex-col min-h-screen items-center justify-start gap-8 p-24`}>
            {/** Panel */}
            <div className={`flex flex-col bg-white dark:bg-gray-900 px-20 py-16 w-[80%] rounded-xl justify-center gap-2`}>
                {/** Navigation Back */}
                <NavigationButton to={"/"} text={`Control Panel`} router={router} Icon={IoMdArrowBack} />

                {/** Names */}
                <div className={`flex flex-row justify-between items-center mb-6`}>
                    <div className={`font-bold text-2xl`}>
                        {`User Management Dashboard`}
                    </div>
                    <div className={`flex flex-col items-end`}>
                        <p>{userData?.name}</p>
                        <p className={`text-sm opacity-50 max-lg:hidden`}>{userData?.user_id}</p>
                    </div>

                </div>

                <div className={`flex flex-row items-center justify-end h-10 gap-2`}>
                    <SearchBar<UsersFindByNameSubmit, UserSuper>
                        router={router}
                        searchFunc={useDebounce(findUsers, 500)}
                        placeholder={`Search Users`}>
                        {({ resultItem: user }) => (
                            <div className={`flex flex-row items-center justify-between`}>
                                <div>
                                    <p className={`font-bold`}>{user.name}</p>
                                    <p className={`text-sm opacity-50`}>{user.user_id}</p>
                                    <p className={`text-sm opacity-50`}>{user.created_at}</p>
                                </div>
                            </div>
                        )}
                    </SearchBar>
                </div>

                {/** Title and face list */}
                <div className={`flex flex-col justify-center`}>
                    {/** Title */}
                    <div className={`flex flex-row justify-between border border-ui-line dark:border-ui-line-dark bg-ui-area dark:bg-ui-area-dark rounded-tl-lg rounded-tr-lg px-4 py-3`}>
                        <p className={`font-bold`}>{`${curPage * pageMaxNum + numThisPage} / ${numTotal} faces`}</p>
                    </div>

                    {/** User List */}
                    <div className={`flex flex-col`}>
                        {users.length > 0 ? (
                            users.map((user, id) => (
                                <UserItem key={id} arrId={id} user={user} users={users} />
                            ))
                        ) : (
                            <div
                                className={`flex flex-row border-x border-b border-ui-line dark:border-ui-line-dark px-4 py-3 justify-between
                                        rounded-bl-lg rounded-br-lg
                                    `}>
                                No users
                            </div>
                        )}

                    </div>
                </div>

                {/** Page Selector */}
                <div className={`flex flex-row w-[60%] max-lg:w-full justify-between mx-auto mt-6`}>
                    {/** Start Page */}
                    <Button
                        type={"Regular"}
                        text={`Start`}
                        Icon={null}
                        callback={() => { setCurPage(0); }}
                        disableWhen={curPage <= 0}
                        excessStyles={`w-[3.5em]`} />

                    <Button
                        type={"Regular"}
                        text={`Prev`}
                        Icon={null}
                        callback={() => {
                            if (curPage > 0) {
                                setCurPage(curPage - 1);
                            }
                        }}
                        disableWhen={curPage <= 0}
                        excessStyles={`w-[4em]`} />

                    {/** 
                     * Extendable Page List 
                     * 0 1 2 3 4 5 6        off = 0     curPage - 7 < 0
                     * 1 2 3 4 5 6 7        off = 1     curPage = 7, curPage - 6 = 1
                     * 2 3 4 5 6 7 8        off = 2     curPage = 8, curPage - 6 = 2
                     * */}
                    {Array.from(
                        { length: Math.min(Math.ceil(numTotal / pageMaxNum), 7) },
                        (_, i) => i + Math.max(0, curPage - 6)     // Define array value
                    ).map((page, i) => (
                        <div key={i}
                            className={`${buttonStyle} border-ui-line 
                                        dark:border-ui-line-dark hover:bg-ui-area 
                                        dark:hover:bg-ui-area-dark w-[2em] h-[2em] 
                                        pt-0.5 rounded-md ${page == curPage && `font-bold`}`}
                            onClick={() => { setCurPage(page); }}>
                            {page}
                        </div>
                    ))}

                    {/** Next Page */}
                    <Button
                        type={"Regular"}
                        text={`Next`}
                        Icon={null}
                        callback={() => {
                            if (curPage < Math.ceil(numTotal / pageMaxNum) - 1) {
                                setCurPage(curPage + 1);
                            }
                        }}
                        disableWhen={curPage >= Math.ceil(numTotal / pageMaxNum) - 1}
                        excessStyles={`w-[4em]`} />

                    {/** End Page */}
                    <Button
                        type={"Regular"}
                        text={`End`}
                        Icon={null}
                        callback={() => {
                            if (curPage < Math.ceil(numTotal / pageMaxNum) - 1) {
                                setCurPage(Math.ceil(numTotal / pageMaxNum) - 1);
                            }
                        }}
                        disableWhen={curPage >= Math.ceil(numTotal / pageMaxNum) - 1}
                        excessStyles={`w-[3.5em]`} />
                </div>
            </div>
        </main>
    );
}