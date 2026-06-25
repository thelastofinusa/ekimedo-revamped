// hooks/use-file-upload.ts
"use client";

import React from "react";
import { toast } from "sonner";
import { PutBlobResult } from "@vercel/blob";

// Minimal form interface – accepts any react‑hook‑form instance
interface FileFieldAccessors {
  getFiles: () => File[];
  setFiles: (files: File[]) => void;
}

export function useFileUpload(config?: FileFieldAccessors) {
  const [isFileUploading, setIsFileUploading] = React.useState(false);
  const [fileBlobMap, setFileBlobMap] = React.useState<
    Record<string, PutBlobResult>
  >({});

  const getFileKey = React.useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  /**
   * Actual upload logic – calls `/api/upload/presigned` for each file.
   */
  const onFileUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      },
    ) => {
      // --- helper: upload a single file via XHR, resolve on success, reject on error ---
      const uploadSingleFile = (file: File): Promise<void> =>
        new Promise<void>((resolve, reject) => {
          const key = getFileKey(file);
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append("file", file);
          formData.append("formType", "inquiry");

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(file, percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const blobResult = JSON.parse(
                  xhr.responseText,
                ) as PutBlobResult;
                onProgress(file, 100);
                // store blob result immediately
                setFileBlobMap((prev) => ({ ...prev, [key]: blobResult }));
                resolve();
              } catch (err) {
                reject(
                  new Error(
                    err instanceof Error
                      ? err.message
                      : `Invalid server response for ${file.name}`,
                  ),
                );
              }
            } else {
              reject(
                new Error(
                  `Upload failed for ${file.name} (status ${xhr.status})`,
                ),
              );
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error(`Network error while uploading ${file.name}`)),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error(`Upload aborted for ${file.name}`)),
          );

          xhr.open("POST", "/api/upload/presigned");
          xhr.send(formData);
        });

      // --- main upload flow ---
      setIsFileUploading(true);
      toast.loading("Uploading files. Please wait…", {
        id: "uploading-assets",
      });

      // Execute all uploads in parallel but capture individual results
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            await uploadSingleFile(file);
            onSuccess(file); // notify the FileUpload component
            return { status: "success" as const, file };
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error("Upload failed");
            onError(file, err);
            return { status: "error" as const, file, error: err };
          }
        }),
      );

      setIsFileUploading(false);

      // --- toast summary ---
      const succeeded = results.filter((r) => r.status === "success").length;
      const failed = results.filter((r) => r.status === "error").length;

      toast.dismiss("uploading-assets");

      if (failed > 0 && succeeded > 0) {
        toast.warning(`${succeeded} uploaded, ${failed} failed`, {
          description: "Some files could not be uploaded.",
          duration: Infinity,
          closeButton: true,
        });
      } else if (failed > 0) {
        toast.error("Upload failed", {
          description: `All ${failed} file${failed > 1 ? "s" : ""} failed to upload.`,
          duration: Infinity,
          closeButton: true,
        });
      } else {
        toast.success("Upload complete", {
          description: `Successfully uploaded ${succeeded} file${succeeded !== 1 ? "s" : ""}.`,
        });
      }
    },
    [getFileKey],
  );

  /**
   * Handle file rejection – shows a toast.
   */
  const onFileReject = React.useCallback((file: File, message: string) => {
    const truncatedName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
    toast.warning(message, {
      description: `"${truncatedName}" has been rejected`,
      duration: 8000,
    });
  }, []);

  /**
   * Custom onChange for the file field – cleans up blob URLs when files are removed.
   */
  const handleFileValueChange = React.useCallback(
    (newFiles: File[]) => {
      if (!config) return; // no config attached – nothing to sync
      const currentFiles = config.getFiles();
      if (currentFiles) {
        const removed = currentFiles.filter(
          (f: File) => !newFiles.find((nf) => getFileKey(nf) === getFileKey(f)),
        );
        if (removed.length > 0) {
          setFileBlobMap((prev) => {
            const updated = { ...prev };
            removed.forEach((file: File) => {
              delete updated[getFileKey(file)];
            });
            return updated;
          });
        }
      }
      config.setFiles(newFiles);
    },
    [config, getFileKey, setFileBlobMap],
  );

  return {
    onFileUpload,
    isFileUploading,
    fileBlobMap,
    setFileBlobMap,
    getFileKey,
    onFileReject,
    handleFileValueChange,
  };
}
