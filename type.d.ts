/**
 * @description Abstract types.
 */

type SingleKeyObj<K extends string, V> = {
    [key in K]: V;
}

type RequestCallbacks<T> = {
    onAuthFailCallback: (e: any) => void,
    onSuccessCallback: (response: AxiosResponse<T>) => void,
    onFailCallback: (e: any) => void
}

type TRequestItem = {
    [key: string]: string
};


/**
 * @description WebSocket related interfaces and types.
 */

/**
 * Basic type of websocket message.
 * @param timestamp The timestamp when the message 
 * starts being broadcasted from the server.
 */
interface WSMsg {
    timestamp: string,
};

/**
 * WebSocket video frame message.
 * @param frameBase64 Base64 string of the video frame.
 */
type WSVideoFrameMsg = WSMsg & {
    frameBase64: string,
};

/**
 * WebSocket face announce message.
 * @param announced_face_frames List of the Base64 strings 
 * of the announced faces.
 */
type WSFaceAnnounceMsg = WSMsg & {
    announced_face_frames: string[],
};

/**
 * WebSocket terminate message.
 * @param terminate A property flag to terminate video 
 * expecting in the frontend.
 */
type WSTerminateMsg = {
    terminate: boolean,
};

/**
 * All types of WebSocket Messages.
 */
type WSMessages = WSVideoFrameMsg | WSFaceAnnounceMsg | WSTerminateMsg;

/** 
 * @description User related types and interfaces.
 * 
 * │││││││││││
 * │      * *│
 * │@│ @  * *@
 * │ └       │
 * │  -      │
 * └──┬───   │
 */

/**
 * A user ORM object.
 * @param user_id UUID string of the user.
 * @param created_at The time when the user is created.
 * @param email Email of the user.
 * @param name Name of the user.
 */
interface UserBasic {
    user_id: string,
    created_at: string,
    email: string,
    name: string,
    permissions: number,
};


type UserSuper = UserBasic & {
    password_hash: string,
    is_verified: boolean,
};

type UsersGetSubmit = {
    range_from: number,
    range_to: number,
}

type UsersGet = WithUserId & UsersGetSubmit;

interface UsersGetResult {
    num_total: number,
    num_this_page: number,
    users: UserSuper[],
};

type EmailVerifySuper = UserAuth & {
    verify_user_id: string,
};

type PermissionEdit = WithUserId & {
    grant: boolean,
    requester_user_id: string,
    permission: number
};

type UsersFindByNameSubmit = {
    query: string,
};

type UsersFindByName = WithUserId & UsersFindByNameSubmit;

type UsersFindResult = {
    users: UserSuper[],
};

/** 
 * @abstract User Login 
 */

/**
 * User login with email.
 * @param email
 * @param password
 */
type UserLoginWithEmail = {
    email: string,
    password: string,
};

/**
 * User login with (user) name.
 * @param name
 * @param password
 */
type UserLoginWithName = {
    name: string,
    password: string
};

/**
 * Raw data from form submission for user login.
 * User could be using either email or name.
 * @param email_or_name
 * @param password
 */
type UserLoginSubmit = {
    email_or_name: string,
    password: string,
};

type UserLoginResponse = {
    msg: string,
    user_id: string,
    access_token: string,
    token_type: string
}

/** 
 * @abstract Register User 
 */

/**
 * User register in the system.
 * @param email
 * @param name
 * @param password
 */
interface UserRegister {
    email: string;
    name: string;
    password: string;
};

/**
 * Raw data from form submission for user register.
 * Need password confirmation in the frontend.
 * @param passwordConfirm Password confirmation whose value needs 
 * to be identical as the one in the password field.
 */
type UserRegisterSubmit = UserRegister & { passwordConfirm: string };

/**
 * User Authorization 
 * @param user_id UUID string of the user.
 * @param token JWT token.
 */
type UserAuth = {
    user_id: string;
    token: string;
};

type WithUserId = {
    user_id: string;
}

// type UsersGet


/**
 * @description Face related types and interfaces.
 */

/**
 * Face ORM Object.
 * @param id UUID string of the face.
 * @param description Description string of the face.
 * @param blob Base64 string of the face.
 * @param uploaded_at The time when the face is uploaded.
 */
interface Face {
    id: string,
    description: string
    blob: string,
    uploaded_at: string,
};

/**
 * Request body to retrieve a list of faces.
 * @param range_from Starting index of the expected list.
 * Doesn't work if the list is empty.
 * @param range_to Ending index of the expected list.
 * Doesn't work if the list is shorter than this index.
 * In this case, the entire list will be returned.
 */
type FacesGetSubmit = {
    range_from: number,
    range_to: number,
}

type FacesGet = WithUserId & FacesGetSubmit;

/**
 * Response of faces retrieval.
 * @param num_total Number of faces in the database.
 * @param num_this_page Number of faces in this page.
 * @param faces List of faces, whose length is num_this_page.
 */
interface FacesGetResult {
    num_total: number,
    num_this_page: number,
    faces: Face[],
};

/**
 * Raw data of face upload request body.
 * @param blob DataURL (base64 with header) string of the face.
 * @param description Description string of the face.
 */
type FaceUploadSubmit = {
    blob: string,       // DataURL
    description: string
};

/**
 * Face upload request body.
 */
type FaceUpload = WithUserId & FaceUploadSubmit;


/**
 * Raw data of the face compare request body.
 * @param blob DataURL (base64 with header) string of the face 
 * to be compared.
 */
type FaceCompareSubmit = {
    blob: string,
};

/**
 * Face compare request body.
 */
type FaceCompare = WithUserId & FaceCompareSubmit;

/**
 * Single response body of the face compare request.
 * @description The description of the compared face.
 * @score The score of this compare.
 */
interface FaceCompareResult {
    description: string,
    score: number,
};

/**
 * Response body of the face compare request.
 * @param desc_scores List of the single response body data.
 * @query_time The time cost of the query.
 */
interface FaceCompareResults {
    desc_scores: FaceCompareResult[],
    query_time: number,
};

/**
 * Raw data of the face update request body.
 * @param face_id UUID of the face to update.
 * @param description Updated description string of the face.
 */
type FaceUpdateSubmit = {
    face_id: string,
    description: string,
};

/**
 * Face update request body.
 */
type FaceUpdate = WithUserId & FaceUpdateSubmit;

/**
 * Face delete request body.
 * @param face_id UUID of the face to delete.
 */
type FaceDelete = WithUserId & {
    face_id: string,
};

/**
 * Face find by description request body.
 * @param description Description.
 */
type FacesFindByDescSubmit = {
    query: string,
}

type FacesFindByDesc = WithUserId & FacesFindByDescSubmit;

type FacesFindResult = {
    faces: Face[],
}
