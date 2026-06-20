import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// Homepage-only fonts. Scoped to the .smoove-home subtree via these CSS
// variables — deliberately NOT applied to <html>/<body>, so admin and the
// booking flow keep using --font-heading / --font-body untouched.
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--home-font-serif",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--home-font-sans",
});
