import { FileText, File, BookOpen, Link as LinkIcon, FileVideo, Image as ImageIcon } from "lucide-react";

const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const videoTypes = ["mp4", "webm", "ogg", "mov"];
const pdfTypes = ["pdf"];

export const getFileType = (url: string) => {
  if (!url) return "unknown";

  const cleanUrl = url.split("?")[0];
  const extension = cleanUrl.split(".").pop()?.toLowerCase();

  if (extension && imageTypes.includes(extension)) return "image";
  if (extension && videoTypes.includes(extension)) return "video";
  if (extension && pdfTypes.includes(extension)) return "pdf";

  return "other";
};

type Props = {
  url: string;
  typeHint?: string | null;
  contentType?: string | null;
  thumbnail_url?: string | null;
};

const mapHintToType = (hint?: string | null) => {
  if (!hint) return undefined;
  const normalized = hint.toLowerCase();
  if (normalized.includes("video")) return "video";
  if (normalized.includes("image")) return "image";
  if (normalized.includes("pdf")) return "pdf";
  if (normalized.includes("article") || normalized.includes("document")) return "pdf";
  return undefined;
};

export const MediaRenderer = ({ url, typeHint, contentType, thumbnail_url }: Props) => {
  // If thumbnail is available, show it as an image
  if (thumbnail_url) {
    return (
      <img
        src={thumbnail_url}
        alt="thumbnail"
        className="w-full h-full rounded-md object-cover"
      />
    );
  }
  
  const hintType = mapHintToType(typeHint);
  const type = hintType || getFileType(url);

  // Show icon based on content type if no media is available
  const renderIconFallback = () => {
    const iconClass = "w-full h-full rounded-md bg-slate-100 flex items-center justify-center text-slate-600";
    
    switch(contentType?.toLowerCase()) {
      case 'video':
        return (
          <div className={iconClass}>
            <FileVideo className="h-12 w-12" />
          </div>
        );
      case 'article':
      case 'recipe':
        return (
          <div className={iconClass}>
            <BookOpen className="h-12 w-12" />
          </div>
        );
      case 'external_link':
        return (
          <div className={iconClass}>
            <LinkIcon className="h-12 w-12" />
          </div>
        );
      case 'document':
        return (
          <div className={iconClass}>
            <FileText className="h-12 w-12" />
          </div>
        );
      case 'pdf':
        return (
          <div className={iconClass}>
            <FileText className="h-12 w-12 text-red-600" />
          </div>
        );
      case 'image':
        return (
          <div className={iconClass}>
            <ImageIcon className="h-12 w-12" />
          </div>
        );
      default:
        return (
          <div className={iconClass}>
            <File className="h-12 w-12" />
          </div>
        );
    }
  };

  if (type === "image") {
    return (
      <img
        src={url}
        alt="preview"
        className="w-full h-full rounded-md object-fill"
      />
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        autoPlay
        muted
        playsInline
        className="w-full h-full rounded-md"
      />
    );
  }

  if (type === "pdf") {
    return (
      <div className="w-full h-full rounded-md bg-slate-100 flex items-center justify-center text-red-600">
        <FileText className="h-12 w-12" />
      </div>
    );
  }

  // Use content type fallback for other types
  return renderIconFallback();
};