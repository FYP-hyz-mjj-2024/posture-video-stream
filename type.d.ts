type UserLoginWithEmail = {
    email: string,
    password: string,
};

type UserLoginWithName = {
    name: string,
    password: string
};

type UserLoginSubmit = {
    email_or_name: string,
    password: string,
};

interface UserRegister {
    email: string;
    name: string;
    password: string;
};

type UserRegisterSubmit = UserRegister & { passwordConfirm: string };

type UserAuth = {
    user_id: string;
    token: string;
};

type FacesGet = UserAuth & {
    range_from: number,
    range_to: number,
};

type FaceUploadSubmit = {
    blob: string,
    description: string
};

type FaceUpload = UserAuth & FaceUploadSubmit;

interface User {
    user_id: string,
    created_at: string,
    email: string,
    name: string,
};

interface Face {
    id: string,
    description: string
    blob: string,
    uploaded_at: string,
};

interface FacesGetResult {
    num_total: number,
    num_this_page: number,
    faces: Face[],
};

interface FaceCompare {
    description: string,
    score: number,
};

interface FaceCompareResults {
    desc_scores: FaceCompare[],
    query_time: number,
};