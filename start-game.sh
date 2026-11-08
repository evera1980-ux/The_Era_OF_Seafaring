#!/bin/bash
# 《The_Era_OF_Seafaring》 强制开启 WebGL 与 GPU 硬件加速启动脚本 (macOS)

echo "🌊 正在写入 macOS Chrome 硬件加速全局策略..."
defaults write com.google.Chrome HardwareAccelerationModeEnabled -bool true
defaults write com.google.Chrome WebGLAllowed -bool true
defaults write com.google.Chrome DefaultWebGLSetting -int 1
defaults write com.google.Chrome HighPerformanceGPUForWebGL -bool true

echo "🚀 正在启动全量 WebGL 硬件加速 Chrome 窗口..."
open -na "Google Chrome" --args \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome-WebGL" \
  --ignore-gpu-blocklist \
  --enable-gpu-rasterization \
  --enable-zero-copy \
  --enable-webgl \
  --use-gl=angle \
  --use-angle=metal \
  "http://localhost:5173"

echo "✨ 启动完成！WebGL 硬件加速已就绪。"
