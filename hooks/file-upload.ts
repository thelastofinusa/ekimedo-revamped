"use client";

import React from "react";
import { toast } from "sonner";

// New type for the asset data we store
interface SanityAssetResult {
  _id: string;
  url: string;
}

interface FileFieldAccessors {
  getFiles: () => File[];
  setFiles: (files: File[]) => void;
}

export function useFileUpload(config?: FileFieldAccessors) {
  const [isFileUploading, setIsFileUploading] = React.useState(false);
  const [fileAssetMap, setFileAssetMap] = React.useState<
    Record<string, SanityAssetResult>
  >({});

  const getFileKey = React.useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  // ------------------------------------------------------------------
  //  Direct Sanity upload with progress
  // ------------------------------------------------------------------
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
      // helper: upload a single file to Sanity's asset API
      const uploadSingleFile = (file: File): Promise<void> =>
        new Promise<void>((resolve, reject) => {
          const key = getFileKey(file);
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append("file", file);

          // Progress
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(file, percent);
            }
          });

          // Success
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                const asset: SanityAssetResult = {
                  _id: json._id,
                  url: json.url,
                };
                onProgress(file, 100);
                setFileAssetMap((prev) => ({ ...prev, [key]: asset }));
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

          // inside uploadSingleFile:
          xhr.open("POST", "/api/upload/sanity");
          // No Authorization header needed – the cookie session authenticates you
          xhr.send(formData);
        });

      // --- main upload flow (unchanged) ---
      setIsFileUploading(true);
      toast.loading("Uploading files. Please wait…", {
        id: "uploading-assets",
      });

      const results = await Promise.all(
        files.map(async (file) => {
          try {
            await uploadSingleFile(file);
            onSuccess(file);
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

  // onFileReject remains identical
  const onFileReject = React.useCallback((file: File, message: string) => {
    const truncatedName =
      file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
    toast.warning(message, {
      description: `"${truncatedName}" has been rejected`,
      duration: 8000,
    });
  }, []);

  // handleFileValueChange – cleans up asset map when files are removed
  const handleFileValueChange = React.useCallback(
    (newFiles: File[]) => {
      if (!config) return;
      const currentFiles = config.getFiles();
      if (currentFiles) {
        const removed = currentFiles.filter(
          (f: File) => !newFiles.find((nf) => getFileKey(nf) === getFileKey(f)),
        );
        if (removed.length > 0) {
          setFileAssetMap((prev) => {
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
    [config, getFileKey],
  );

  return {
    onFileUpload,
    isFileUploading,
    fileAssetMap, // renamed from fileBlobMap
    setFileAssetMap,
    getFileKey,
    onFileReject,
    handleFileValueChange,
  };
}
