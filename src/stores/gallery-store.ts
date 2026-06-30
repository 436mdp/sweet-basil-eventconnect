import { create } from "zustand";

interface GalleryStore {
  selectedUploader: string | null;
  searchQuery: string;
  setSelectedUploader: (uploader: string | null) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  selectedUploader: null,
  searchQuery: "",
  setSelectedUploader: (uploader) => set({ selectedUploader: uploader }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set({ selectedUploader: null, searchQuery: "" }),
}));
