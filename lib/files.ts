import imageCompression, { Options } from 'browser-image-compression';

export const MAX_FILE_SIZE = 200 * 1024 * 1024;    // 200 MB

/**
 * Convert a file's binary part into base64.
 * @param file File object.
 * @returns 
 */
export function _fileToBase64(file: File, keepHeader = false): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (!reader.result) {
                return null;
            }
            const result = reader.result as string;
            if (keepHeader) {
                resolve(result);
            } else {
                resolve(result.split(',')[1]);
            }
        };
        reader.onerror = error => reject(error);
    });
}


/**
 * Construct a Blob object using data URL. Note that
 * a data URL is basically a base64 string with a 
 * header:
 * 
 * data:image/png;base64,ivB......
 * @param dataURL Data URL to construct the Blob object.
 * @returns 
 */
export function _dataURLtoFile(dataURL: string): File {
    // Match mime type
    const matches = dataURL.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
    if (!matches) {
        throw new Error("Invalid Base64 format");
    }

    const mimeType = matches[1];
    const fileType = mimeType.split("/")[1];
    const byteString = atob(matches[3]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    const fileName = `face_upload_${Date.now().toString()}.${fileType}`;

    return new File([uint8Array], fileName, { type: mimeType });
};


/**
 * Compress a dataURL of an image to a base64 string (headerless) with
 * the specified options.
 * @param dataURL 
 * @returns 
 */
export async function _compressImage(dataURL: string, options: Options): Promise<string> {
    // Convert data url to file, compress file.
    const file = _dataURLtoFile(dataURL);
    const compressedFile = await imageCompression(file, options);

    // Extract base64 string part of the file.
    const compressedBase64 = await _fileToBase64(compressedFile);

    return compressedBase64
}


/**
 * Check for the magic number to determine file type.
 * @param blob Blob base64 string.
 * @returns 
 */
export function checkFileTypeFromBase64(blob: string) {
    if (blob.startsWith("iVBORw0KGgo")) {
        return "png";
    } else if (blob.startsWith("/9j/")) {
        return "jpg";
    } else {
        throw new DOMException("Invalid file format.");
    }
}

/**
 * Receiving a fileList from browser, get the target file's base64.
 * @param _fileList FileList object. 
 * @returns The base64 encoded binary of the first file in the file list.
 */
export async function pruneFileList(_fileList: FileList): Promise<string | null> {
    // Invalid FileList length.
    if (!_fileList || _fileList.length <= 0) {
        alert("Invalid file.");
        return null;
    }

    const fileList = Array.from(_fileList);

    // Can only upload one face at a time.
    if (fileList.length > 1) {
        alert("Only one file is allowed.");
        return null;
    } else if (fileList.length <= 0) {
        alert("Internal Error: File list is empty.");
        return null;
    }

    // Remove the "list" dimension.
    const file = fileList[0];

    // Check file size.
    if (file.size > MAX_FILE_SIZE) {
        alert(`Your file has size of ${Math.ceil(file.size / (1024 * 1024))} MB, 
                   while the maximum allowed is ${Math.ceil(MAX_FILE_SIZE / (1024 * 1024))}.`);
        return null;
    }

    // Keep the headers now as data URL.
    const blob = await _fileToBase64(file, true);
    return blob
}

/**
 * Handle drop to upload file.
 * @param event HTML div element drag event.
 * @param callback Callback function to work on the promised result.
 * @returns Promise of the blob or null.
 */
export async function handleFileInputDrop(
    event: React.DragEvent<HTMLDivElement>,
    callback: (blob: string) => void
): Promise<string | null> {

    event.preventDefault();
    event.stopPropagation();

    const droppedFileList: FileList = event.dataTransfer.files;

    return pruneFileList(droppedFileList).then((blob) => {
        if (blob) {
            callback(blob);
        }
        return blob;
    })
}

/**
 * Handle click to upload file.
 * @param event HTML input element change event. 
 * @param callback Callback function to work on the promised result.
 * @returns Promise of the blob or null.
 */
export async function handleFileInputClick(
    event: React.ChangeEvent<HTMLInputElement>,
    callback: (blob: string) => void
): Promise<string | null> {

    const selectedFileList: FileList | null = event.target.files;

    if (!selectedFileList) {
        return null;
    }

    return pruneFileList(selectedFileList).then((blob) => {
        if (blob) {
            callback(blob);
        }
        return blob;
    })
}