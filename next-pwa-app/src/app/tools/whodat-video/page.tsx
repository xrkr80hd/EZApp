"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";
import { getCurrentCustomerId } from "@/lib/customer-files";

export default function WhodatVideoPage() {
  const [customerName, setCustomerName] = useState("Customer");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const name = getCurrentCustomerId();
    if (name) setCustomerName(name);
  }, []);

  const selectVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFileName(file.name);
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${customerName}_WhoDAT_Video.webm`;
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
          accept="video/*"
          onChange={selectVideo}
          className="hidden"
          aria-label="Upload video file"
        />

        {videoFileName && (
          <p className="mb-3 text-xs text-gray-400 text-center">Selected: {videoFileName}</p>
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
    </>
  );
}
