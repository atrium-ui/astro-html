import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import * as vite from "vite";
import child_process from "node:child_process";

/**
 * @param {object} options
 * @param {string | ((name: string) => string)} options.filename - The filename to use for the output files. Use `[name]` to insert the page name.
 * @returns {import('astro').AstroIntegration}
 */
export default function email(options) {
  return {
    name: "email",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url;
        if (!url) return next();

        // Extract the filename from any sub-path
        const segments = url.split("/").filter(Boolean);
        const filename = segments[segments.length - 1];

        // Only handle requests for files with extensions
        if (filename?.includes(".")) {
          const publicPath = path.join(process.cwd(), "public", filename);

          if (fs.existsSync(publicPath)) {
            const stat = fs.statSync(publicPath);
            if (stat.isFile()) {
              res.setHeader("Content-Length", stat.size);
              const stream = fs.createReadStream(publicPath);
              stream.pipe(res);
              return;
            }
          }
        }

        next();
      });
    },
    hooks: {
      "astro:config:setup": ({
        command,
        updateConfig,
        injectRoute,
        addRenderer,
        addDevToolbarApp,
      }) => {
        addRenderer({
          name: "astro-html/react",
          serverEntrypoint: "@astrojs/react/server.js",
        });

        updateConfig({
          vite: {
            plugins: [
              react(),
              optionsPlugin(false), // required for @astrojs/react/server.js to work.
            ],
            build: {
              assetsInlineLimit: 1024 * 20, // inline all assets
            },
          },
          compressHTML: false,
          build: {
            format: "file",
          },
        });

        injectRoute({
          pattern: "/",
          entrypoint: "astro-html/index.astro",
        });

        addDevToolbarApp("astro-html/toolbar.js");
      },
      "astro:build:done": async ({ dir, pages }) => {
        if (options.filename) {
          const manifest = [];

          for (const page of pages) {
            const pathname = page.pathname;
            const basename = pathname.split(".")[0];

            if (!pathname) continue; // index has none

            const name =
              typeof options.filename === "string"
                ? options.filename.replace("[name]", basename)
                : options.filename(basename);

            fs.renameSync(
              path.resolve(dir.pathname, `${pathname}.html`),
              path.resolve(dir.pathname, name),
            );

            const files = [name];

            // Add all public files
            const publicDir = path.resolve("public");
            if (fs.existsSync(publicDir)) {
              const publicFiles = fs.readdirSync(publicDir);
              for (const publicFile of publicFiles) {
                const publicFilePath = path.resolve(publicDir, publicFile);
                if (fs.statSync(publicFilePath).isFile()) {
                  files.push(publicFile);
                }
              }
            }

            // check if an .jpg file with the same name exists and copy it to dist too.
            const jpgPath = path.resolve("src/pages", `${pathname}.jpg`);
            if (fs.existsSync(jpgPath)) {
              const newJpgName =
                typeof options.filename === "string"
                  ? options.filename
                      .replace("[name]", basename)
                      .replace(/\.[^.]+$/, ".jpg")
                  : options.filename(basename).replace(/\.[^.]+$/, ".jpg");
              fs.copyFileSync(jpgPath, path.resolve(dir.pathname, newJpgName));
              files.push(newJpgName);
            }

            manifest.push({
              name: pathname,
              files: files,
            });
          }

          fs.writeFileSync(
            path.resolve(dir.pathname, "manifest.json"),
            JSON.stringify(manifest, null, 2),
          );
        }
      },
      "astro:server:setup": ({ server }) => {
        server.ws.on("astro-dev-toolbar:astro-html:toggled", (data) => {
          if (data.state === true) {
            child_process.exec("astro build");
          }
        });
      },
    },
  };
}

/** @type {(xperimentalReactChildren?: boolean) => vite.Plugin} */
function optionsPlugin(experimentalReactChildren) {
  const virtualModule = "astro:react:opts";
  const virtualModuleId = `\0${virtualModule}`;
  return {
    name: "astro-html/react:opts",
    resolveId(id) {
      if (id === virtualModule) {
        return virtualModuleId;
      }
    },
    load(id) {
      if (id === virtualModuleId) {
        return {
          code: `export default {
						experimentalReactChildren: ${JSON.stringify(experimentalReactChildren)}
					}`,
        };
      }
    },
  };
}
