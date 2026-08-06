import type { ImgHTMLAttributes } from "react";

export type GeneratedIconName =
  | "bingo"
  | "charades"
  | "gift-games"
  | "home"
  | "locked-gift"
  | "open-gift"
  | "party"
  | "pass-phone"
  | "play"
  | "reveal-match"
  | "secret-santa"
  | "steal-gift"
  | "timer"
  | "tools"
  | "trivia"
  | "white-elephant";

const sizes = { sm: 32, md: 64, lg: 128 } as const;

export function GeneratedIcon({
  name,
  size = "sm",
  className = "",
  ...props
}: {
  name: GeneratedIconName;
  size?: keyof typeof sizes;
  className?: string;
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "children" | "src" | "width" | "height" | "alt"
>) {
  const pixels = sizes[size];
  return (
    <img
      src={`/icons/generated/${pixels}/${name}.webp`}
      width={pixels}
      height={pixels}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={`object-contain ${className}`}
      {...props}
    />
  );
}
