import React from "react";
import { AssetKey } from "../../types";
import { assetRegistry } from "../../assets/AssetRegistry";

interface GameAssetProps {
  assetKey: AssetKey;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * 统一程序化 SVG / 外部贴图热替换渲染组件
 * 当 assetManifest.json 将某资源切换为 "image" 模式时自动渲染外部 PNG/WebP，失败时无缝回退程序化 SVG
 */
export const GameAsset: React.FC<GameAssetProps> = ({
  assetKey,
  alt = "",
  className = "",
  width,
  height,
}) => {
  const src = assetRegistry.resolveAssetUri(assetKey);

  return (
    <img
      src={src}
      alt={alt || assetKey}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        const fallback = assetRegistry.resolveProceduralFallback(assetKey);
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
};
