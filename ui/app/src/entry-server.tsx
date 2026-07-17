// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { resolveAppPath } from "@/utils/paths/app-paths";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={import.meta.env.VITE_GOOGLE_REDIRECT_URI}
          />
          <meta
            property="og:title"
            content="K9X | Rankings & Working Dog Performance Index"
          />
          <meta
            property="og:description"
            content="Track and compare working dogs by FCI results. Scores, exercises, standings and rankings, powered by K9X."
          />
          <meta property="og:image" content={resolveAppPath("/k9x-512.png")} />
          <meta property="og:image:width" content="512" />
          <meta property="og:image:height" content="512" />
          <meta property="og:image:type" content="image/png" />
          <link rel="icon" href={resolveAppPath("/favicon.svg")} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap"
            {...{ "attr:onload": "this.onload=null;this.rel='stylesheet'" }}
          />
          <noscript>
            <link
              href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap"
              rel="stylesheet"
            />
          </noscript>
          <title>Canine Index</title>
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
