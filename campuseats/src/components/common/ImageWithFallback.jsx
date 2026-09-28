import { useState } from "react";
import { ImageOff } from "lucide-react";
import "./ImageWithFallback.css";

export default function ImageWithFallback({ src, alt, className = "", ratio, ...rest }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`img-fallback ${className}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={22} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={ratio ? { aspectRatio: ratio, objectFit: "cover", width: "100%" } : undefined}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
