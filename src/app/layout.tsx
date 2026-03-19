import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | FreePics",
    default: "FreePics - 免费 AI 高清壁纸",
  },
  description: "FreePics 是一个免费的 AI 生成高清壁纸分享平台，每天更新精美的 4K/2K 写实与动漫壁纸。",
  metadataBase: new URL("https://freepics.cc"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
