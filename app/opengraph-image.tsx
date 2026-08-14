import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE_NAME } from "@/lib/site-metadata";

export const alt = `${SITE_NAME} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * One image for both locales. The card carries a name, a domain and a stack list
 * — none of which translate — so a locale-aware variant would have to live under
 * `app/[lang]/`, where `proxy.ts` would redirect `/en/opengraph-image` away and
 * break the URL Next emits. Neutral copy is the cheaper correct answer.
 *
 * Satori (which renders this) supports flexbox and a subset of CSS only: no grid,
 * and any element with more than one child needs an explicit `display: flex`.
 */
const Image = async () => {
  const fontDir = join(process.cwd(), "public/fonts");
  const [nohemiLight, nohemiMedium, wordmark] = await Promise.all([
    readFile(join(fontDir, "Nohemi-Light.otf")),
    readFile(join(fontDir, "Nohemi-Medium.otf")),
    readFile(join(fontDir, "hkgroteskwide-black.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(1000px 600px at 88% -10%, rgba(45,212,191,0.16), transparent 60%)",
          fontFamily: "Nohemi",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Wordmark", fontSize: 44, color: "#fafafa" }}>
          #HSC
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "NohemiMedium",
              fontSize: 24,
              letterSpacing: 6,
              color: "#2dd4bf",
            }}
          >
            SOFTWARE ENGINEER
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 104,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#fafafa",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: "rgba(250,250,250,0.6)",
            }}
          >
            React · Next.js · React Native · AI-native workflows
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 32,
            borderTop: "1px solid rgba(250,250,250,0.14)",
            fontSize: 24,
            color: "rgba(250,250,250,0.5)",
          }}
        >
          <div style={{ display: "flex" }}>Istanbul, Turkey</div>
          <div style={{ display: "flex" }}>burakhasici.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nohemi", data: nohemiLight, weight: 300, style: "normal" },
        { name: "NohemiMedium", data: nohemiMedium, weight: 500, style: "normal" },
        { name: "Wordmark", data: wordmark, weight: 900, style: "normal" },
      ],
    },
  );
};

export default Image;
