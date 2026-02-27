"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";
import { getCurrentCustomerId, upsertCustomerFile } from "@/lib/customer-files";

type VideoMeta = {
  fileName: string;
  mimeType: string;
  size: number;
  savedAt: string;
};

export default function WhodatVideoPage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [savedMeta, setSavedMeta] = useState<VideoMeta | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const name = getCurrentCustomerId();
    if (name) setCustomerName(name);
  }, []);

  useEffect(() => {
    if (!customerName || customerName === "Customer") return;
    const raw = localStorage.getItem(`whodatVideoMeta_${customerName}`);
    if (!raw) return;
    try {
      setSavedMeta(JSON.parse(raw) as VideoMeta);
    } catch {
      setSavedMeta(null);
    }
  }, [customerName]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [videoUrl]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2400);
  };

  const selectVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      showToast("Please select a valid video file.");
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFileName(file.name);
    setSelectedVideoFile(file);
  };

  const saveVideo = () => {
    if (!selectedVideoFile) {
      showToast("Select a video first.");
      return;
    }
    const meta: VideoMeta = {
      fileName: selectedVideoFile.name,
      mimeType: selectedVideoFile.type,
      size: selectedVideoFile.size,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`whodatVideoMeta_${customerName}`, JSON.stringify(meta));
    upsertCustomerFile(customerName, { video: meta });
    setSavedMeta(meta);
    showToast("WhoDAT video saved.");
  };

  const downloadVideo = () => {
    if (!videoUrl || !selectedVideoFile) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    const ext = selectedVideoFile.name.includes(".")
      ? selectedVideoFile.name.split(".").pop()
      : "mp4";
    a.download = `${customerName}_WhoDAT_Video.${ext}`;
    a.click();
  };

  return (
    <>
      <Navbar title="Who Dat Video" actions={[{ label: "Tools", href: "/tools" }]} />
      <div className="max-w-[600px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title={`${customerName} — Video`}
          subtitle="Upload customer introduction video"
        />

        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black aspect-video mb-4">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
              No video selected
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          onChange={selectVideo}
          className="hidden"
          aria-label="Upload video file"
        />

        {videoFileName && (
          <p className="mb-3 text-xs text-gray-400 text-center">Selected: {videoFileName}</p>
        )}
        {savedMeta && (
          <p className="mb-3 text-xs text-emerald-300 text-center">
            Saved: {savedMeta.fileName} ({new Date(savedMeta.savedAt).toLocaleString()})
          </p>
        )}

        <div className="flex gap-3 justify-center">
          {!videoUrl && (
            <button
              onClick={() => fileRef.current?.click()}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
            >
              Upload Video
            </button>
          )}
          {videoUrl && (
            <>
              <button
                onClick={saveVideo}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                ✅ Save Video
              </button>
              <button
                onClick={downloadVideo}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
              >
                💾 Download Video
              </button>
              <button
                onClick={() => {
                  if (videoUrl) URL.revokeObjectURL(videoUrl);
                  setVideoUrl(null);
                  setVideoFileName(null);
                  setSelectedVideoFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="px-6 py-3 rounded-xl bg-[#333] hover:bg-[#444] text-gray-300 text-sm font-semibold transition-colors"
              >
                Choose Different Video
              </button>
            </>
          )}
        </div>

        <PageFooter />
      </div>
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[70] rounded-lg border border-emerald-500/40 bg-emerald-950/90 px-4 py-2 text-sm text-emerald-100 shadow-lg">
          {toastMessage}
        </div>
      )}
    </>
  );
}
