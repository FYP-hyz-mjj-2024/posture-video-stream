import axios, { AxiosError, AxiosResponse } from "axios";
import imageCompression from 'browser-image-compression';
import { _compressImage, _dataURLtoFile, _fileToBase64 } from "./files";


/**
 * Upload a face, and get the comparasion result.
 * @param faceCompareSubmit Face upload submit data: user_id, token, blob.
 * @param callbacks.onAuthFailCallback Callback when the user is not logged in.
 * @param callbacks.onSuccessCallback Callback when the upload is successful.
 * @param callbacks.onFailCallback Callback when the upload is failed.
 * @returns 
 */
export async function compareFace(
    faceCompareSubmit: FaceCompareSubmit,
    callbacks: {
        onAuthFailCallback: () => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!user_id || !token) {
        callbacks.onAuthFailCallback();
        return;
    }

    // Remove the header of the base64 string.
    if (!faceCompareSubmit.blob) {
        alert("No file is selected.");
        return;
    }

    let blob: string;
    try {
        const options = {
            maxSizeMB: 0.07,
            useWebWorker: true,
        };

        console.log("Compressing....")
        blob = await _compressImage(faceCompareSubmit.blob, options);
    } catch (e) {
        callbacks.onFailCallback(e);
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
 * Upload fa face to store in the database.
 * @param faceUploadSubmit Face upload submit data: user_id, token, blob, description.
 * @param callbacks.onAuthFailCallback Callback when the user is not logged in.
 * @param callbacks.onSuccessCallback Callback when the upload is successful.
 * @param callbacks.onFailCallback Callback when the upload is failed.
 */
export async function uploadFace(
    faceUploadSubmit: FaceUploadSubmit,
    callbacks: {
        onAuthFailCallback: () => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!user_id || !token) {
        alert("Your login info is expired. Please re-login.");
        callbacks.onAuthFailCallback();
        return;
    }

    // Remove the header of the base64 string.
    if (!faceUploadSubmit.blob) {
        alert("No file is selected.");
        return;
    }

    let blob: string;
    try {
        const options = {
            maxSizeMB: 0.07,
            useWebWorker: true,
        };

        console.log("Compressing....")
        blob = await _compressImage(faceUploadSubmit.blob, options);
    } catch (e) {
        callbacks.onFailCallback(e);
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

export async function updateFace(
    faceUpdateSubmit: FaceUpdateSubmit,
    callbacks: {
        onAuthFailCallback: () => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!user_id || !token) {
        alert("Your login info is expired. Please re-login.");
        callbacks.onAuthFailCallback();
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
 * @returns 
 */
export async function deleteFace(
    face_id: string,
    callbacks: {
        onAuthFailCallback: () => void,
        onSuccessCallback: (response: AxiosResponse<FaceCompareResults>) => void,
        onFailCallback: (e: any) => void
    }
) {
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!user_id || !token) {
        alert("Your login info is expired. Please re-login.");
        callbacks.onAuthFailCallback();
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