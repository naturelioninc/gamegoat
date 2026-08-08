import type { ImgHTMLAttributes } from "react";

export type GeneratedIconName =
  | "bingo"
  | "bingo-celebration"
  | "caller"
  | "charades"
  | "correct"
  | "end-game"
  | "game-over"
  | "gift-games"
  | "home"
  | "incorrect"
  | "join-code"
  | "locked-gift"
  | "draw-names"
  | "open-gift"
  | "party"
  | "pass-phone"
  | "pause"
  | "play"
  | "players"
  | "print"
  | "randomize"
  | "reveal-match"
  | "resume"
  | "score"
  | "secret-santa"
  | "secret-santa-complete"
  | "steal-gift"
  | "skip-turn"
  | "timer"
  | "tools"
  | "trivia"
  | "sound-haptics"
  | "unopened-gift"
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
  const highDensityPixels = Math.min(pixels * 2, 128);
  return (
    <img
      src={`/icons/generated/${highDensityPixels}/${name}.webp`}
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
