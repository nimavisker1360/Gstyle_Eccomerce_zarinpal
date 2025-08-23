import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from "@/lib/constants";
import ClientProviders from "@/components/shared/client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}. ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: "/icons/logo01.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/logo01.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/logo01.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: "/icons/logo01.png",
    apple: "/icons/logo01.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
