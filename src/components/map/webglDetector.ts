/**
 * 检测当前浏览器环境是否支持并启用了 WebGL
 */
export function checkWebGLSupport(): { supported: boolean; reason?: string } {
  try {
    if (!window.WebGLRenderingContext) {
      return { supported: false, reason: "Browser does not support WebGLRenderingContext" };
    }
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      canvas.getContext("webgl2");

    if (!gl) {
      return { supported: false, reason: "Unable to initialize WebGL context" };
    }

    return { supported: true };
  } catch (e) {
    return { supported: false, reason: (e as Error).message };
  }
}
