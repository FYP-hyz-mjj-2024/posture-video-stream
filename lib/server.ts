// Site packages
import axios, { AxiosError, AxiosResponse } from "axios";

// Locals
import { _compressImage, _dataURLtoFile, _fileToBase64 } from "./files";
import { _getUserAuth } from "./auth";


/**
 * Manual email verification by super user.
 * @param verifyUserId User id for email verification.
 * @param callbacks 
 * @returns 
 */
export async function verifyEmailSuper(
    verifyUserId: string,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const emailVerifySuper: EmailVerifySuper = {
        user_id: user_id,
        token: token,
        verify_user_id: verifyUserId,
    };


    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/verify_email_super/`,
        emailVerifySuper
    ).then((response) => {
        if (!response) return;
        callbacks.onSuccessCallback(response);
    }).catch((e: AxiosError) => {
        callbacks.onFailCallback(e);
    })

};


/**
 * Superuser function: Grant or revoke permission to non-super users. One at a time.
 * @param requester_user_id 
 * @param permission 
 * @param callbacks 
 */
export async function editPermission(
    requester_user_id: string,
    permission: number,
    grant: boolean,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }) {
    const { user_id: operator_user_id, token } = _getUserAuth();

    if (!operator_user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const permissionEdit: PermissionEdit = {
        grant: grant,
        requester_user_id: requester_user_id,
        operator_user_id: operator_user_id,
        token: token,
        permission: permission,
    };

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/edit_permission/`,
        permissionEdit
    ).then((response) => {
        if (!response) return;
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });

}


/**
 * Superuser function: Find a user in superuser's perspective.
 * @param faceFindByDescSubmit 
 * @param callbacks 
 * @returns 
 */
export async function findUsers(
    faceFindByDescSubmit: UsersFindByNameSubmit,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<UsersFindResult>) => void,
        onFailCallback: (e: any) => void
    }
) {

    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const usersFindByName = {
        user_id: user_id,
        token: token,
        query: faceFindByDescSubmit.query,
    }

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/user/find_users/`,
        usersFindByName
    ).then((response) => {
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });
}



/**
 * Upload a face, and get the comparasion result.
 * @param faceCompareSubmit Face upload submit data: user_id, token, blob.
 * @param callbacks
 * @returns 
 */
export async function compareFace(
    faceCompareSubmit: FaceCompareSubmit,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {

    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    // Remove the header of the base64 string.
    if (!faceCompareSubmit.blob) {
        callbacks.onFailCallback({
            localMessage: "No file selected. Please at least select one file.",
        });
        return;
    }

    let blob: string;
    try {
        const options = {
            maxSizeMB: 0.07,
            useWebWorker: true,
        };

        blob = await _compressImage(faceCompareSubmit.blob, options);
    } catch (e) {
        callbacks.onFailCallback({
            localMessage: "An error occurred during compression for upload_face."
        });
        return;
    }

    const faceCompare: FaceCompare = {
        user_id: user_id,
        token: token,
        blob: blob,
    };

    // Upload.
    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/compare_face/`,
        faceCompare
    ).then((response) => {
        if (!response) {
            return;
        }
        callbacks.onSuccessCallback(response);
    }).catch((e: AxiosError) => {
        callbacks.onFailCallback(e);
    });
}


/**
 * Upload face to store in the database.
 * @param faceUploadSubmit Face upload submit data: user_id, token, blob, description.
 * @param callbacks.onAuthFailCallback Callback when the user is not logged in.
 * @param callbacks.onSuccessCallback Callback when the upload is successful.
 * @param callbacks.onFailCallback Callback when the upload is failed.
 */
export async function uploadFace(
    faceUploadSubmit: FaceUploadSubmit,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    // Remove the header of the base64 string.
    if (!faceUploadSubmit.blob) {
        callbacks.onFailCallback({
            localMessage: "No file selected. Please at least select one file.",
        });
        return;
    }

    let blob: string;
    try {
        const options = {
            maxSizeMB: 0.07,
            useWebWorker: true,
        };

        blob = await _compressImage(faceUploadSubmit.blob, options);
    } catch (e) {
        callbacks.onFailCallback({
            localMessage: "An error occurred during compression for upload_face."
        });
        return;
    }

    const faceUpload: FaceUpload = {
        user_id: user_id,
        token: token,
        blob: blob,
        description: faceUploadSubmit.description
    };

    // Upload.
    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/upload_face/`,
        faceUpload
    ).then((response) => {
        if (!response) {
            return;
        }
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });
}

/**
 * Update the information of a face.
 * @param faceUpdateSubmit Face update submit data: face_id, description.
 * @param callbacks
 * @returns 
 */
export async function updateFace(
    faceUpdateSubmit: FaceUpdateSubmit,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const faceUpdate: FaceUpdate = {
        user_id: user_id,
        token: token,
        face_id: faceUpdateSubmit.face_id,
        description: faceUpdateSubmit.description
    };

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/update_face/`,
        faceUpdate
    ).then((response) => {
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });
}

/**
 * Delete a face.
 * @param face_id Face id. 
 * @param callbacks
 * @returns 
 */
export async function deleteFace(
    face_id: string,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const faceDelete = {
        user_id: user_id,
        token: token,
        face_id: face_id
    };

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/delete_face/`,
        faceDelete
    ).then((response) => {
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });
}

/**
 * Find a face.
 * @param findFaceByDescSubmit Face find by description submit data: description.
 * @param callbacks
 * @returns  
 * */
export async function findFaces(
    faceFindByDescSubmit: FacesFindByDescSubmit,
    callbacks: {
        onAuthFailCallback: (e: any) => void,
        onSuccessCallback: (response: AxiosResponse<FacesFindResult>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const { user_id, token } = _getUserAuth();

    if (!user_id || !token) {
        callbacks.onAuthFailCallback({
            localMessage: "Your login info is expired. Please re-login."
        });
        return;
    }

    const faceFindDesc = {
        user_id: user_id,
        token: token,
        query: faceFindByDescSubmit.query,
    }

    axios.post(
        `${process.env.NEXT_PUBLIC_DB_DOMAIN}/face/find_faces/`,
        faceFindDesc
    ).then((response) => {
        callbacks.onSuccessCallback(response);
    }).catch((e) => {
        callbacks.onFailCallback(e);
    });
}


/**
 * Get message from multiple possible error forms.
 * @param e 
 * @returns 
 */
export function _getErrorMessage(e: any) {
    let message;
    if (e.localMessage) {
        message = e.localMessage;
    }
    else if (e.response?.data.detail) {
        message = e.response?.data.detail;
    }
    else {
        message = "Unknown error occurred. Please try again."
    }

    return message;
}