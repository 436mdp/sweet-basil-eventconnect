import { create } from "zustand";

export interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface UploadStore {
  items: UploadItem[];
  addFiles: (files: File[]) => void;
  removeItem: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadItem["status"], error?: string) => void;
  clearCompleted: () => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  items: [],
  addFiles: (files) =>
    set((state) => ({
      items: [
        ...state.items,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "pending" as const,
        })),
      ],
    })),
  removeItem: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return { items: state.items.filter((i) => i.id !== id) };
    }),
  updateProgress: (id, progress) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, progress } : i)),
    })),
  setStatus: (id, status, error) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status, error, progress: status === "done" ? 100 : i.progress } : i
      ),
    })),
  clearCompleted: () =>
    set((state) => {
      state.items.filter((i) => i.status === "done").forEach((i) => URL.revokeObjectURL(i.preview));
      return { items: state.items.filter((i) => i.status !== "done") };
    }),
  reset: () =>
    set((state) => {
      state.items.forEach((i) => URL.revokeObjectURL(i.preview));
      return { items: [] };
    }),
}));
