import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MotionConfig } from "framer-motion";
import { fontVariables } from "@/lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    // Animations follow the visitor's "reduce motion" system setting
    <MotionConfig reducedMotion="user">
      <div className={fontVariables}>
        <Component {...pageProps} />
      </div>
    </MotionConfig>
  );
}
