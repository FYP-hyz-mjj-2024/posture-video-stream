/** 
 * User
 */
interface User {
    user_id: string,
    created_at: string,
    email: string,
    name: string,
};

/** User Login */
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

/** Register User */
interface UserRegister {
    email: string;
    name: string;
    password: string;
};

type UserRegisterSubmit = UserRegister & { passwordConfirm: string };

/** User Authorization */
type UserAuth = {
    user_id: string;
    token: string;
};


/**
 * Face
 */
interface Face {
    id: string,
    description: string
    blob: string,
    uploaded_at: string,
};

/** Get Faces */
type FacesGet = UserAuth & {
    range_from: number,
    range_to: number,
};

interface FacesGetResult {
    num_total: number,
    num_this_page: number,
    faces: Face[],
};

/** Upload Face */
type FaceUploadSubmit = {
    blob: string,
    description: string
};

type FaceUpload = UserAuth & FaceUploadSubmit;


/** Compare Face  */
type FaceCompareSubmit = {
    blob: string,
};

type FaceCompare = UserAuth & FaceCompareSubmit;

interface FaceCompareResult {
    description: string,
    score: number,
};

interface FaceCompareResults {
    desc_scores: FaceCompareResult[],
    query_time: number,
};

/** Delete Face */
type FaceDelete = UserAuth & {
    face_id: string,
};

