export type Platform = "ios" | "android" | "other";

export function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";

  const ua =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";
  const lower = ua.toLowerCase();

  if (lower.includes("android")) return "android";
  if (
    lower.includes("iphone") ||
    lower.includes("ipad") ||
    lower.includes("ipod")
  ) {
    return "ios";
  }

  return "other";
}

