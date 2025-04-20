/**
 * @summary Callback function types.
 * 
 */
/**
 * @description Callbacks of requests.
 */
type RequestCallbacks<T> = {
    onSuccess: (response: AxiosResponse<T>) => void,
    onFail: (e: any) => void
};

/**
 * @description Callbacks of requests with authorization.
 */
type RequestCallbacksAuth<T> = {
    onAuthFail: (e: any) => void
} & RequestCallbacks<T>;


/**
 * @summary WebSocket related interfaces and types.
 * 
 */

/**
 * @description Basic type of websocket message.
 * @param timestamp The timestamp when the message 
 * starts being broadcasted from the server.
 */
interface WSMsg {
    timestamp: string,
};

/**
 * @description WebSocket video frame message.
 * @param frameBase64 Base64 string of the video frame.
 */
type WSVideoFrameMsg = WSMsg & {
    frameBase64: string,
};

/**
 * @description WebSocket face announce message.
 * @param announced_face_frames List of the Base64 strings 
 * of the announced faces.
 */
type WSFaceAnnounceMsg = WSMsg & {
    announced_face_frames: string[],
};

/**
 * @description WebSocket terminate message.
 * @param terminate A property flag to terminate video 
 * expecting in the frontend.
 */
type WSTerminateMsg = {
    terminate: boolean,
};

/**
 * @description Unified type of all of WebSocket Messages.
 */
type WSMessages = WSVideoFrameMsg | WSFaceAnnounceMsg | WSTerminateMsg;

/** 
 * @summary Form submits, request bodies, request results and ORM objects for /user/ api.
 * 
 * │││││││││││
 * │      * *│
 * │@│ @  * *@
 * │ └       │
 * │  -      │
 * └──┬───   │
 */

/**
 * @description User Authorization.
 */
type WithUserId = {
    user_id: string;
}

/**
 * @description A basic user ORM object.
 */
interface UserBasic {
    user_id: string,
    created_at: string,
    email: string,
    name: string,
    permissions: number,
};

/**
 * @description A super user ORM object.
 */
type UserSuper = UserBasic & {
    password_hash: string,
    is_verified: boolean,
};

/**
 * @description Form submit of /user/get_users
 */
type UsersGetSubmit = {
    range_from: number,
    range_to: number,
}

/**
 * @description Request body of /user/get_users
 */
type UsersGet = WithUserId & UsersGetSubmit;

/**
 * @description Result of /user/get_users
 */
interface UsersGetResult {
    num_total: number,
    num_this_page: number,
    users: UserSuper[],
};

/**
 * @description Form submit of /user/verify_email_super
 */
type EmailVerifySuperSubmit = {
    verify_user_id: string,
};

/**
 * @description Request body of /user/verify_email_super
 */
type EmailVerifySuper = WithUserId & EmailVerifySuperSubmit;

/**
 * @description Form submit of /user/edit_permission
 */
type PermissionEditSubmit = {
    grant: boolean,
    requester_user_id: string,
    permission: number
};

/**
 * @description Request body of /user/edit_permission
 */
type PermissionEdit = WithUserId & PermissionEditSubmit;

/**
 * @description Form submit of /user/find_users/
 */
type UsersFindByNameSubmit = {
    query: string,
};

/**
 * @description Request body of /user/find_users/
 */
type UsersFindByName = WithUserId & UsersFindByNameSubmit;

/**
 * @description Result of /user/find_users/
 */
type UsersFindResult = {
    users: UserSuper[],
};

/** 
 * @abstract User Login 
 */

/**
 * @description Form submit of /user/login/
 */
type UserLoginSubmit = {
    email_or_name: string,
    password: string,
};

/**
 * @description Request body (email) of /user/login/
 */
type UserLoginWithEmail = {
    email: string,
    password: string,
};

/**
 * @description Request body (name) of /user/login/
 */
type UserLoginWithName = {
    name: string,
    password: string
};

/**
 * @description Result of /user/login
 */
type UserLoginResponse = {
    msg: string,
    user_id: string,
    access_token: string,
    token_type: string
}

/**
 * @description Request body of /user/register/
 */
interface UserRegister {
    email: string;
    name: string;
    password: string;
};

/**
 * @description Form submit of /user/register/
 */
type UserRegisterSubmit = UserRegister & { passwordConfirm: string }; // (Only submit that's larger than request body.)


/**
 * @summary Form submits, request bodies, request results and ORM objects for /face/ api.
 */

/**
 * @description Face ORM Object.
 */
interface Face {
    id: string,
    description: string
    blob: string,
    uploaded_at: string,
};

/**
 * @description Form submit of /face/get_faces/
 */
type FacesGetSubmit = {
    range_from: number,
    range_to: number,
}

/**
 * @description Request body of /face/get_faces/
 */
type FacesGet = WithUserId & FacesGetSubmit;

/**
 * @description Result of /face/get_faces/
 */
interface FacesGetResult {
    num_total: number,
    num_this_page: number,
    faces: Face[],
};

/**
 * @description Form submit of /face/upload_face/
 */
type FaceUploadSubmit = {
    blob: string,       // DataURL
    description: string
};

/**
 * @description Request body of /face/upload_face/
 */
type FaceUpload = WithUserId & FaceUploadSubmit;


/**
 * @description Form submit of /face/compare_face/
 */
type FaceCompareSubmit = {
    blob: string,
};

/**
 * @description Request body of /face/upload_face/
 */
type FaceCompare = WithUserId & FaceCompareSubmit;

/**
 * @description Single response body of /face/compare_face/
 */
interface FaceCompareResult {
    description: string,
    score: number,
};

/**
 * @description Result of /face/compare_face/
 */
interface FaceCompareResults {
    desc_scores: FaceCompareResult[],
    query_time: number,
};

/**
 * @description Form submit of /face/update_face/
 */
type FaceUpdateSubmit = {
    face_id: string,
    description: string,
};

/**
 * @description Request body of /face/update_face/
 */
type FaceUpdate = WithUserId & FaceUpdateSubmit;

/**
 * @description Form submit of /face/delete_face/
 */
type FaceDeleteSubmit = {
    face_id: string,
};

/**
 * @description Request body of /face/delete_face/
 */
type FaceDelete = WithUserId & FaceDeleteSubmit;

/**
 * @description Form submit of /face/find_faces/
 */
type FacesFindByDescSubmit = {
    query: string,
}

/**
 * @description Request body of /face/find_faces/
 */
type FacesFindByDesc = WithUserId & FacesFindByDescSubmit;

/**
 * @description Result of /face/find_faces/
 */
type FacesFindResult = {
    faces: Face[],
}
