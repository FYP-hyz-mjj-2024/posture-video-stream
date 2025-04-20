// Site packages
import axios, { AxiosError } from "axios";

// Locals
import { _compressImage, _dataURLtoFile, _fileToBase64 } from "./files";
import { _getUserAuth } from "./auth";

const available_services = {
    "user": [
        "login",
        "register",
        "get_user",
        "get_users",
        "edit_permission",
        "find_users",
        "verify_email_super"
    ],
    "face": [
        "get_faces",
        "compare_face",
        "upload_face",
        "update_face",
        "delete_face",
        "find_faces"
    ]
} as const;


/**
 * @description A factory function that produces an async server function based on the required services.
 * @param field A string specifying which field the service is.
 * @param service A string specifying which service to request.
 * @param asyncPreProcess An async function that pre-processes the form submit. e.g., file compress.
 * @returns A product, i.e., an async server function.
 */
export function serverFuncFactory<FormSubmitType, ResponseType>(
    field: keyof typeof available_services,                                     // Factory param: Define api field.
    service: (typeof available_services)[typeof field][number],                 // Factory param: Define api service.
    asyncPreProcess: ((submit: FormSubmitType) => Promise<any>) | null = null   // Factory param: Define form submit pre-processing.
): (
    formSubmit: FormSubmitType,                     // Product param: Form submit object. Check @/type.d.ts
    callbacks: RequestCallbacksAuth<ResponseType>   // Product param: Callbacks under different request responses.
) => Promise<void> {
    return async function (
        formSubmit: FormSubmitType,
        callbacks: RequestCallbacksAuth<ResponseType>
    ): Promise<void> {

        // User authentication.
        const { user_id, token } = _getUserAuth();

        if (!user_id || !token) {
            callbacks.onAuthFail({
                localMessage: "Your login information is expired. Please re-login.",
            });
            return;
        }

        // Pre-process form submit.
        if (asyncPreProcess) {
            formSubmit = await asyncPreProcess(formSubmit);
        }

        // Prepare request.
        const requestBody: FormSubmitType & WithUserId = {
            user_id: user_id,
            ...formSubmit,
        }

        const requestOptions = {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }

        // Send request.
        axios.post(
            `${process.env.NEXT_PUBLIC_DB_DOMAIN}/${field}/${service}/`,
            requestBody,
            requestOptions
        ).then((response) => {
            if (!response) {
                callbacks.onFail({ localMessage: "Response is empty." });
            }
            callbacks.onSuccess(response);
        }).catch((e: AxiosError) => {
            callbacks.onFail(e);
        });
    }
}

/**
 * @description Get message from multiple possible error forms.
 * @param e Catched error.
 * @returns The error message extracted.
 */
export function getErrorMessage(e: any) {
    let msg;
    if (e.localMessage) {
        // Customized local error object.
        msg = e.localMessage;
    }
    else if (e.response?.data.detail) {
        msg = e.response?.data.detail;
    } else if (e.message) {
        msg = e.message;
    }
    else {
        msg = "Unknown error occurred. Please try again.";
        console.error(e);
    }
    return msg;
}

/**
 * @description A literal of async pre-processing over a form submit.
 * @param submit A form submit object that contains blob.
 * @returns The processed form submit.
 */
export async function compressFormSubmit(submit: { blob: string } & any): Promise<string> {
    if (!submit.blob) {
        throw new Error("No file selected. Please at least select one file.");
    }

    let blob: string;

    try {
        const options = {
            maxSizeMB: 0.07,
            useWebWorker: true,
        };
        blob = await _compressImage(submit.blob, options);
        submit.blob = blob;
    } catch (e) {
        throw new Error("An error occurred during compression for upload face.");
    }

    return submit;
}

/**
 * @description Manual email verification by super user.
 */
export const verifyEmailSuper = serverFuncFactory<EmailVerifySuperSubmit, any>("user", "verify_email_super");

/**
 * @description Get user data using authentication detials: user_id and token.
 */
export const getUser = serverFuncFactory<{}, UserBasic>("user", "get_user");

/**
 * @description Retrieve users given a range.
 */
export const getUsers = serverFuncFactory<UsersGetSubmit, UsersGetResult>("user", "get_users");

/**
 * @description Superuser function: Grant or revoke permission to non-super users. One at a time.
 */
export const editPermission = serverFuncFactory<PermissionEditSubmit, any>("user", "edit_permission");

/**
 * @description Superuser function: Find a user in superuser's perspective.
 */
export const findUsers = serverFuncFactory<UsersFindByNameSubmit, UsersFindResult>("user", "find_users");

/**
 * @description Retrieve faces given a range.
 */
export const getFaces = serverFuncFactory<FacesGetSubmit, FacesGetResult>("face", "get_faces");

/**
 * @description Upload a face, and get the comparasion result.
 */
export const compareFace = serverFuncFactory<FaceCompareSubmit, FaceCompareResults>("face", "compare_face", compressFormSubmit);

/**
 * @description Upload face to store in the database.
 */
export const uploadFace = serverFuncFactory<FaceUploadSubmit, any>("face", "upload_face", compressFormSubmit);

/**
 * @description Update the information of a face.
 */
export const updateFace = serverFuncFactory<FaceUpdateSubmit, any>("face", "update_face");

/**
 * @description Delete a face.
 */
export const deleteFace = serverFuncFactory<FaceDeleteSubmit, any>("face", "delete_face");

/**
 * @description Blurry search faces.
 * */
export const findFaces = serverFuncFactory<FacesFindByDescSubmit, FacesFindResult>("face", "find_faces");


