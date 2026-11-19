"use client";

import Image from "next/image";

import { useTranslation } from "@/components/language-provider";
import {
  ProjectLightbox,
  useProjectLightbox,
  type LightboxImage,
} from "@/components/project-lightbox";

/**
 * A row of tall images inside a case study's MDX body — App Store screenshots and
 * the like. Columns are always a third of the text width, so a row of two or one
 * keeps the same image size as a row of three instead of blowing up. Below `sm`
 * the row scrolls sideways with snap points; every image opens in the lightbox,
 * paging within its own row.
 */
export const ImageRow = ({ images }: { images: LightboxImage[] }) => {
  const { dict } = useTranslation();
  const copy = dict.projects;
  const lightbox = useProjectLightbox();

  return (
    <div className="mt-8 mb-2">
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
        {images.map((image, index) => (
          <li key={image.src} className="shrink-0 basis-[44%] snap-start sm:basis-auto">
            <button
              type="button"
              onClick={() => lightbox.open(index)}
              aria-label={`${copy.gallery_expand} — ${image.alt}`}
              className="group block w-full overflow-hidden rounded-2xl border border-zinc-200/95 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/[0.12] dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.25)] dark:focus-visible:ring-white/35"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 768px) 240px, 44vw"
                className="h-auto w-full transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          </li>
        ))}
      </ul>

      <ProjectLightbox
        images={images}
        state={lightbox}
        copy={{ prev: copy.gallery_prev, next: copy.gallery_next, close: copy.gallery_close }}
      />
    </div>
  );
};
