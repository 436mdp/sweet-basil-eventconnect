"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadStore } from "@/stores/upload-store";
import { compressImage, validateImageFile } from "@/lib/compress-image";
import { uploadPhoto } from "@/lib/actions/photos";

interface DropzoneProps {
  eventId: string;
  onUploadComplete?: () => void;
}

export function Dropzone({ eventId, onUploadComplete }: DropzoneProps) {
  const { items, addFiles, removeItem, updateProgress, setStatus, clearCompleted } = useUploadStore();
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles = files.filter((file) => {
        const error = validateImageFile(file);
        if (error) toast.error(`${file.name}: ${error}`);
        return !error;
      });
      addFiles(validFiles);
    },
    [addFiles]
  );

  const handleUploadAll = async () => {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length === 0) return;

    setUploading(true);
    for (const item of pending) {
      try {
        setStatus(item.id, "uploading");
        updateProgress(item.id, 30);

        const compressed = await compressImage(item.file);
        updateProgress(item.id, 60);

        const formData = new FormData();
        formData.append("eventId", eventId);
        formData.append("file", compressed);

        const result = await uploadPhoto(formData);
        updateProgress(item.id, 100);

        if (result.error) {
          setStatus(item.id, "error", result.error);
          toast.error(result.error);
        } else {
          setStatus(item.id, "done");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setStatus(item.id, "error", message);
        toast.error(message);
      }
    }
    setUploading(false);
    clearCompleted();
    onUploadComplete?.();
    toast.success("Upload complete!");
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          processFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Drag & drop photos here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          or tap to browse · JPG, PNG, WEBP · Max 20MB
        </p>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                {item.status === "uploading" && <Progress value={item.progress} className="mt-1 h-1" />}
                {item.error && <p className="text-xs text-destructive">{item.error}</p>}
              </div>
              {item.status === "pending" && (
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              {item.status === "done" && <ImageIcon className="h-4 w-4 text-green-600" />}
            </div>
          ))}
          <Button onClick={handleUploadAll} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : `Upload ${items.filter((i) => i.status === "pending").length} Photos`}
          </Button>
        </div>
      )}
    </div>
  );
}
