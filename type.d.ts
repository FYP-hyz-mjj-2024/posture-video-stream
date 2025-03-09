type UserLoginWithEmail = {
    email: string,
    password: string,
}

type UserLoginWithName = {
    name: string,
    password: string
}

type UserLoginSubmit = {
    email_or_name: string,
    password: string,
}

type UserRegister = {
    email: string;
    name: string;
    password: string;
}

type UserRegisterSubmit = UserRegister & { passwordConfirm: string };

type UserAuth = {
    user_id: string;
    token: string;
}

interface User {
    user_id: string,
    created_at: string,
    email: string,
    name: string,
};