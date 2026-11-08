import React from "react";
import { AssetKey } from "../../types";
import { assetRegistry } from "../../assets/AssetRegistry";

interface GameAssetProps {
  assetKey: AssetKey | string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  resolutionTier?: "Master" | "@3x" | "@2x" | "@1x";
}

/**
 * 统一 64 枚海事 ICON 资产 / 外部贴图 / 程序化 SVG 热替换渲染组件
 * 自动适配移动端 @1x / @2x / @3x 视网膜多倍图，当图片加载失败时无缝回退至高精度等轴测 SVG
 */
export const GameAsset: React.FC<GameAssetProps> = ({
  assetKey,
  alt = "",
  className = "",
  width,
  height,
  resolutionTier,
}) => {
  const src = resolutionTier
    ? assetRegistry.resolveIconPath(assetKey, resolutionTier)
    : assetRegistry.resolveAssetUri(assetKey);
  const srcSet = resolutionTier ? undefined : assetRegistry.resolveIconSrcSet(assetKey);

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt || assetKey}
      width={width}
      height={height}
      referrerPolicy="no-referrer"
      className={className}
      onError={(e) => {
        const fallback = assetRegistry.resolveProceduralFallback(assetKey);
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.removeAttribute("srcset");
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
};
