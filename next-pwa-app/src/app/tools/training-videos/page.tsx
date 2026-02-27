"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar, PageHeader, PageFooter } from "@/components/ui";

type TrainingVideo = {
  title: string;
  url: string;
};

const STORAGE_KEY = "training_videos";
const DEFAULT_TRAINING_VIDEOS: TrainingVideo[] = [
  { title: "Why High Tech Polymer?", url: "https://youtu.be/v3RWwxRH3aM" },
  { title: "Virtual Factory Tour", url: "https://youtu.be/sgXFZjWyMdE" },
  { title: "How to Deliver A Masterful Product Demo", url: "https://youtu.be/nMPqQ9LXjTo" },
  {
    title: "How To Kill Tile",
    url: "https://www.youtube.com/watch?v=3svRUUM4Upk&ab_channel=BathConceptsTraining",
  },
  { title: "How To Make Your Bathroom Safe", url: "https://youtu.be/LxGyrFRD7eU" },
  { title: "Safe & Accessible / Walk-in Tub", url: "https://youtu.be/sdOcwWbGSkQ" },
  {
    title: "Liquid Accents Shower Door Tutorial",
    url: "https://youtu.be/exhzuCzaAT0?si=de8UUNSKHUTvPXrm",
  },
  {
    title: "Diagnosing The Bath: Before / After",
    url: "https://youtu.be/STDu0-VwN0I?si=Np46v_2FZg7z5qBF",
  },
  { title: "How To Kill The Do Nothing Option", url: "https://youtu.be/ohr1FVsHeAk" },
  { title: "Product Objections and Rebuttals", url: "https://youtu.be/_LNScBuVuZk" },
  { title: "Call Center Product Training", url: "https://youtu.be/3JpXgCG38Xw" },
  { title: "Choosing The Right Accessories", url: "https://youtu.be/GNXxiiegHh4" },
  { title: "Understanding Moen Products", url: "https://youtu.be/2BfdQAY6gqg" },
  {
    title: "Product Positioning / Price Conditioning",
    url: "https://youtu.be/3Phk0mf1gVI?si=pMlHdAGdlrdwyIz0",
  },
  { title: "Bath Inspection", url: "https://youtu.be/DqAvC9CHbb8" },
  { title: "BCI Selling The Difference", url: "https://youtu.be/nYGAHYVA3k8" },
];

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] || null;
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function getEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1` : null;
}

export default function TrainingVideosPage() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setVideos(DEFAULT_TRAINING_VIDEOS);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as TrainingVideo[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setVideos(parsed);
      } else {
        setVideos(DEFAULT_TRAINING_VIDEOS);
      }
    } catch {
      setVideos(DEFAULT_TRAINING_VIDEOS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    if (videos.length === 0) {
      setSelectedUrl(null);
      return;
    }
    if (!selectedUrl || !videos.some((v) => v.url === selectedUrl)) {
      setSelectedUrl(videos[0].url);
    }
  }, [videos, selectedUrl]);

  const canAdd = useMemo(() => title.trim() && getYouTubeId(url), [title, url]);
  const selectedVideo = videos.find((v) => v.url === selectedUrl) || null;
  const selectedEmbed = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

  const playInApp = (videoUrl: string) => {
    setSelectedUrl(videoUrl);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const addVideo = () => {
    const cleanTitle = title.trim();
    const cleanUrl = url.trim();
    if (!cleanTitle || !cleanUrl) return;
    if (!getYouTubeId(cleanUrl)) {
      alert("Please paste a valid YouTube link.");
      return;
    }
    setVideos((prev) => [{ title: cleanTitle, url: cleanUrl }, ...prev]);
    setSelectedUrl(cleanUrl);
    setTitle("");
    setUrl("");
  };

  return (
    <>
      <Navbar title="Training Videos" actions={[{ label: "Tools", href: "/tools" }]} />

      <div className="max-w-[1050px] mx-auto px-5 pt-20 pb-10">
        <PageHeader
          title="Training Videos"
          subtitle="Tap a thumbnail to play inside this page"
        />

        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-5">
          <div className="mb-3">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-1">Now Playing</p>
            <p className="text-sm font-semibold text-white">
              {selectedVideo?.title || "Select a training video below"}
            </p>
          </div>

          <div className="aspect-video rounded-lg overflow-hidden border border-white/[0.12] bg-black">
            {selectedEmbed ? (
              <iframe
                src={selectedEmbed}
                title={selectedVideo?.title || "Training video player"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                Choose a valid YouTube video.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 mb-5 space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2.5 text-sm text-gray-100"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-white/[0.12] bg-black/20 px-3 py-2.5 text-sm text-gray-100"
            />
            <button
              onClick={addVideo}
              disabled={!canAdd}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Supports `youtube.com/watch`, `youtu.be`, and `youtube.com/shorts` links.
          </p>
        </section>

        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] p-8 text-center text-sm text-gray-400">
            No training videos added yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((video, idx) => {
              const thumb = getThumbnail(video.url);
              return (
                <article
                  key={`${video.url}-${idx}`}
                  className={`w-full max-w-[240px] mx-auto rounded-xl border overflow-hidden ${
                    selectedUrl === video.url
                      ? "border-[#3a83d0] bg-[#16304d]/40"
                      : "border-white/[0.08] bg-white/[0.03]"
                  }`}
                >
                  <button type="button" onClick={() => playInApp(video.url)} className="w-full text-left">
                    <div className="aspect-video bg-[#1b1b1b] flex items-center justify-center">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 px-4 text-center">Preview unavailable</span>
                      )}
                    </div>
                  </button>
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-semibold text-white line-clamp-2">{video.title}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => playInApp(video.url)}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold bg-[#244b7a] hover:bg-[#2e5d97] text-white"
                      >
                        Play Here
                      </button>
                      <button
                        onClick={() => {
                          setVideos((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold border border-red-500/40 text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <PageFooter />
      </div>
    </>
  );
}
