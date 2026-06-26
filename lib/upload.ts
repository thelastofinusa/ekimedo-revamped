export interface SanityAssetResult {
  _id: string;
  url: string;
}

// lib/upload.ts
export class AuthError extends Error {
  constructor(message = "Authentication required. Please sign in again.") {
    super(message);
    this.name = "AuthError";
  }
}

export function uploadFileToSanity(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<SanityAssetResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve({ _id: json._id, url: json.url });
        } catch (err) {
          reject(
            new Error(
              err instanceof Error ? err.message : "Invalid server response",
            ),
          );
        }
      } else if (xhr.status === 401) {
        reject(new AuthError());
      } else {
        reject(new Error(`Upload failed (status ${xhr.status})`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", "/api/upload/sanity");
    xhr.send(formData);
  });
}
