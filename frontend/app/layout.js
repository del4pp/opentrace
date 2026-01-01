import { LanguageProvider } from "../context/LanguageContext";
import { ResourceProvider } from "../context/ResourceContext";
import Layout from "../components/Layout";
import "./globals.css";

export const metadata = {
  title: "OpenTrace Analytics",
  description: "Self-hosted analytics platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <ResourceProvider>
            <Layout>{children}</Layout>
          </ResourceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
