import { forwardRef } from "react";
import Image from "next/image";

// Hosts allowed in next.config.js images.remotePatterns
const OPTIMIZABLE = /^(\/(?!\/)|https:\/\/(res\.cloudinary\.com|i\.postimg\.cc)\/)/;

interface Props {
  src: string;
  alt: string;
  emoji?: string;
  /** Size of the box the photo is contained in (e.g. "h-[170px] w-[220px]") */
  className?: string;
  imgClassName?: string;
  /** Font size of the emoji placeholder */
  emojiClassName?: string;
  sizes: string;
  priority?: boolean;
}

/** Dish photo, contained in a fixed box. Falls back to the dish emoji when there's no photo. */
const DishImage = forwardRef<HTMLImageElement, Props>(function DishImage(
  { src, alt, emoji, className = "", imgClassName = "", emojiClassName = "text-[64px]", sizes, priority },
  ref
) {
  if (!src) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <span
          ref={ref as never}
          className={`flex aspect-square h-[78%] items-center justify-center rounded-full border-2 border-dashed border-ink/40 ${emojiClassName}`}
          role="img"
          aria-label={alt}
        >
          {emoji || "🍔"}
        </span>
      </div>
    );
  }
  return (
    <div className={`relative ${className}`}>
      <Image
        ref={ref}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={!OPTIMIZABLE.test(src)}
        className={`object-contain ${imgClassName}`}
      />
    </div>
  );
});

export default DishImage;
