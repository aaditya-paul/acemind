import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AceMind - AI-Powered Learning Platform",
  description:
    "Personalized AI tutoring and study assistance for every learner",
  icons: {
    icon: [
      {url: "/api/favicon?size=16", sizes: "16x16", type: "image/png"},
      {url: "/api/favicon?size=32", sizes: "32x32", type: "image/png"},
      {url: "/api/favicon?size=48", sizes: "48x48", type: "image/png"},
    ],
    shortcut: "/api/favicon?size=32",
    apple: {url: "/api/favicon?size=180", sizes: "180x180", type: "image/png"},
  },
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/api/favicon?size=16"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/api/favicon?size=32"
          sizes="32x32"
          type="image/png"
        />
        <link
          rel="icon"
          href="/api/favicon?size=48"
          sizes="48x48"
          type="image/png"
        />
        <link rel="shortcut icon" href="/api/favicon?size=32" />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=180"
          sizes="180x180"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=152"
          sizes="152x152"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=144"
          sizes="144x144"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=120"
          sizes="120x120"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=114"
          sizes="114x114"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=76"
          sizes="76x76"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=72"
          sizes="72x72"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=60"
          sizes="60x60"
        />
        <link
          rel="apple-touch-icon"
          href="/api/favicon?size=57"
          sizes="57x57"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
