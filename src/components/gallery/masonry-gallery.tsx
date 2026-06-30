"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { Download, Share2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGalleryStore } from "@/stores/gallery-store";
import { recordPhotoView } from "@/lib/actions/photos";
import type { Photo, UploaderFolder } from "@/types/database.types";

interface MasonryGalleryProps {
  eventId: string;
  initialPhotos: Photo[];
  uploaders: UploaderFolder[];
}

export function MasonryGallery({ eventId, initialPhotos, uploaders }: MasonryGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [cursor, setCursor] = useState<string | null>(
    initialPhotos.length > 0 ? initialPhotos[initialPhotos.length - 1].uploaded_at : null
  );
  const [hasMore, setHasMore] = useState(initialPhotos.length >= 24);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { selectedUploader, searchQuery, setSelectedUploader, setSearchQuery } = useGalleryStore();
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const params = new URLSearchParams({ eventId, limit: "24" });
    if (cursor) params.set("cursor", cursor);
    if (selectedUploader) params.set("uploader", selectedUploader);
    if (searchQuery) params.set("search", searchQuery);

    const res = await fetch(`/api/photos?${params}`);
    const data = await res.json();

    if (data.photos?.length) {
      setPhotos((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newPhotos = data.photos.filter((p: Photo) => !ids.has(p.id));
        return [...prev, ...newPhotos];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [cursor, eventId, hasMore, loading, searchQuery, selectedUploader]);

  useEffect(() => {
    setPhotos(initialPhotos);
    setCursor(initialPhotos.length > 0 ? initialPhotos[initialPhotos.length - 1].uploaded_at : null);
    setHasMore(initialPhotos.length >= 24);
  }, [initialPhotos, selectedUploader, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchMore();
      },
      { threshold: 0.1 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [fetchMore]);

  const handlePhotoClick = async (photo: Photo) => {
    setSelectedPhoto(photo);
    await recordPhotoView(photo.id, eventId);
  };

  const handleDownload = async (photo: Photo) => {
    const res = await fetch(`/api/photos/${photo.id}/download`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = photo.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (photo: Photo) => {
    if (navigator.share) {
      await navigator.share({ title: photo.file_name, url: photo.file_url });
    } else {
      await navigator.clipboard.writeText(photo.file_url);
    }
  };

  const filteredPhotos = photos.filter((p) => {
    if (selectedUploader && p.uploader_name !== selectedUploader) return false;
    if (searchQuery && !p.file_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.uploader_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const breakpointColumns = { default: 4, 1024: 3, 768: 2, 480: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedUploader === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedUploader(null)}
          >
            All Photos
          </Badge>
          {uploaders.map((u) => (
            <Badge
              key={u.uploader_name}
              variant={selectedUploader === u.uploader_name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedUploader(u.uploader_name)}
            >
              {u.uploader_name}&apos;s Photos ({u.photo_count})
            </Badge>
          ))}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No photos yet. Be the first to upload!</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-grid-column"
        >
          {filteredPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="cursor-pointer overflow-hidden rounded-xl"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="relative">
                <Image
                  src={photo.file_url}
                  alt={photo.file_name}
                  width={400}
                  height={300}
                  className="w-full rounded-xl object-cover transition-transform hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-sm font-medium text-white">{photo.uploader_name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      )}

      <div ref={observerRef} className="py-4">
        {loading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          {selectedPhoto && (
            <div className="relative">
              <Image
                src={selectedPhoto.file_url}
                alt={selectedPhoto.file_name}
                width={1200}
                height={800}
                className="max-h-[80vh] w-full rounded-xl object-contain"
              />
              <div className="mt-4 flex items-center justify-between rounded-xl bg-card p-4">
                <div>
                  <p className="font-medium">{selectedPhoto.uploader_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPhoto.file_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleShare(selectedPhoto)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDownload(selectedPhoto)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedPhoto(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
