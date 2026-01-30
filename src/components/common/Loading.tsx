"use client";

import React from "react";
import {
  BallTriangle,
  Bars,
  Circles,
  Grid,
  Hearts,
  Oval,
  Puff,
  Rings,
  TailSpin,
  ThreeDots,
  Watch,
  RotatingLines,
  InfinitySpin,
  ColorRing,
  Triangle,
  Hourglass,
  ProgressBar,
  Audio,
  MutatingDots,
  RevolvingDot,
  RotatingSquare,
  Vortex,
  FidgetSpinner,
  Discuss,
  FallingLines,
  LineWave,
  MagnifyingGlass,
  Radio,
  Comment,
  ThreeCircles,
} from "react-loader-spinner";
import "./Loading.scss";

// Các loại spinner có sẵn
export type LoaderVariant =
  | "ball-triangle"
  | "bars"
  | "circles"
  | "grid"
  | "hearts"
  | "oval"
  | "puff"
  | "rings"
  | "tail-spin"
  | "three-dots"
  | "watch"
  | "rotating-lines"
  | "infinity-spin"
  | "color-ring"
  | "triangle"
  | "hourglass"
  | "progress-bar"
  | "audio"
  | "mutating-dots"
  | "revolving-dot"
  | "rotating-square"
  | "vortex"
  | "fidget-spinner"
  | "discuss"
  | "dna"
  | "falling-lines"
  | "line-wave"
  | "magnifying-glass"
  | "radio"
  | "comment"
  | "three-circles";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LoadingProps {
  /** Loại spinner */
  variant?: LoaderVariant;
  /** Kích thước */
  size?: LoaderSize;
  /** Màu chính */
  color?: string;
  /** Màu phụ (nếu có) */
  secondaryColor?: string;
  /** Text hiển thị bên dưới */
  text?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Có backdrop tối không */
  overlay?: boolean;
  /** Custom className */
  className?: string;
}

// Map size sang pixels
const sizeMap: Record<LoaderSize, number> = {
  xs: 24,
  sm: 40,
  md: 60,
  lg: 80,
  xl: 100,
};

// Màu mặc định (primary gradient color)
const DEFAULT_COLOR = "#667eea";
const DEFAULT_SECONDARY = "#764ba2";

export function Loading({
  variant = "ball-triangle",
  size = "md",
  color = DEFAULT_COLOR,
  secondaryColor = DEFAULT_SECONDARY,
  text,
  fullScreen = false,
  overlay = false,
  className = "",
}: LoadingProps) {
  const pixelSize = sizeMap[size];

  const renderSpinner = () => {
    const commonProps = {
      visible: true,
      ariaLabel: "loading",
    };

    switch (variant) {
      case "ball-triangle":
        return (
          <BallTriangle
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "bars":
        return (
          <Bars
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "circles":
        return (
          <Circles
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "grid":
        return (
          <Grid
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "hearts":
        return (
          <Hearts
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "oval":
        return (
          <Oval
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
            secondaryColor={secondaryColor}
          />
        );

      case "puff":
        return (
          <Puff
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "rings":
        return (
          <Rings
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "tail-spin":
        return (
          <TailSpin
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "three-dots":
        return (
          <ThreeDots
            {...commonProps}
            height={pixelSize}
            width={pixelSize * 1.5}
            color={color}
          />
        );

      case "watch":
        return (
          <Watch
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "rotating-lines":
        return (
          <RotatingLines
            visible={true}
            width={String(pixelSize)}
            strokeWidth="3"
            strokeColor={color}
            animationDuration="0.75"
          />
        );

      case "infinity-spin":
        return (
          <InfinitySpin
            visible={true}
            width={String(pixelSize * 2)}
            color={color}
          />
        );

      case "color-ring":
        return (
          <ColorRing
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            colors={["#667eea", "#764ba2", "#f093fb", "#f5576c", "#667eea"]}
          />
        );

      case "triangle":
        return (
          <Triangle
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "hourglass":
        return (
          <Hourglass
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            colors={[color, secondaryColor]}
          />
        );

      case "progress-bar":
        return (
          <ProgressBar
            visible={true}
            height={pixelSize / 2}
            width={pixelSize * 2}
            borderColor={color}
            barColor={secondaryColor}
          />
        );

      case "audio":
        return (
          <Audio
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "mutating-dots":
        return (
          <MutatingDots
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
            secondaryColor={secondaryColor}
          />
        );

      case "revolving-dot":
        return (
          <RevolvingDot
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
            secondaryColor={secondaryColor}
          />
        );

      case "rotating-square":
        return (
          <RotatingSquare
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "vortex":
        return (
          <Vortex
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            colors={[
              "#667eea",
              "#764ba2",
              "#f093fb",
              "#f5576c",
              "#11998e",
              "#4facfe",
            ]}
          />
        );

      case "fidget-spinner":
        return (
          <FidgetSpinner
            visible={true}
            height={pixelSize}
            width={pixelSize}
            backgroundColor={color}
            ballColors={[color, secondaryColor, "#f093fb"]}
          />
        );

      case "discuss":
        return (
          <Discuss
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            colors={[color, secondaryColor]}
          />
        );

      case "falling-lines":
        return (
          <FallingLines
            visible={true}
            height={String(pixelSize)}
            width={String(pixelSize)}
            color={color}
          />
        );

      case "line-wave":
        return (
          <LineWave
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );

      case "magnifying-glass":
        return (
          <MagnifyingGlass
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            glassColor={secondaryColor}
            color={color}
          />
        );

      case "radio":
        return (
          <Radio
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            colors={[color, secondaryColor, "#f093fb"]}
          />
        );

      case "comment":
        return (
          <Comment
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            backgroundColor={color}
            color="#fff"
          />
        );

      case "three-circles":
        return (
          <ThreeCircles
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
            outerCircleColor={color}
            innerCircleColor={secondaryColor}
            middleCircleColor="#f093fb"
          />
        );

      default:
        return (
          <BallTriangle
            {...commonProps}
            height={pixelSize}
            width={pixelSize}
            color={color}
          />
        );
    }
  };

  const containerClass = [
    "loading",
    fullScreen && "loading--fullscreen",
    overlay && "loading--overlay",
    `loading--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      <div className="loading__spinner">{renderSpinner()}</div>
      {text && <p className="loading__text">{text}</p>}
    </div>
  );
}

// ============ Preset Components ============

/** Loading toàn trang */
export function PageLoading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <Loading variant="ball-triangle" size="lg" fullScreen overlay text={text} />
  );
}

/** Loading inline nhỏ gọn */
export function InlineLoading({ text }: { text?: string }) {
  return <Loading variant="three-dots" size="sm" text={text} />;
}

/** Loading cho button */
export function ButtonLoading({ color = "#fff" }: { color?: string }) {
  return <Loading variant="tail-spin" size="xs" color={color} />;
}

/** Loading cho card/section */
export function CardLoading({ text }: { text?: string }) {
  return <Loading variant="rotating-lines" size="md" text={text} />;
}

/** Loading khi search */
export function SearchLoading({
  text = "Đang tìm kiếm...",
}: {
  text?: string;
}) {
  return <Loading variant="magnifying-glass" size="md" text={text} />;
}

/** Loading khi đăng nhập/đăng ký */
export function AuthLoading({ text = "Đang xác thực..." }: { text?: string }) {
  return (
    <Loading variant="hourglass" size="md" fullScreen overlay text={text} />
  );
}

/** Loading khi comment */
export function CommentLoading({ text }: { text?: string }) {
  return <Loading variant="comment" size="sm" text={text} />;
}

/** Loading DNA style */
export function DnaLoading({ text }: { text?: string }) {
  return <Loading variant="dna" size="lg" text={text} />;
}

export default Loading;
