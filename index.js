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
              publicAssetsPlugin(),
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
          const publicDir = path.resolve("public");
          const publicFiles = [];

          if (fs.existsSync(publicDir)) {
            const files = fs.readdirSync(publicDir);
            for (const file of files) {
              const publicFilePath = path.resolve(publicDir, file);
              if (fs.statSync(publicFilePath).isFile()) {
                publicFiles.push(file);
              }
            }
          }

          for (const page of pages) {
            const pathname = page.pathname;
            const basename = pathname.split(".")[0];

            if (!pathname) continue;

            const name =
              typeof options.filename === "string"
                ? options.filename.replace("[name]", basename)
                : options.filename(basename);

            fs.renameSync(
              path.resolve(dir.pathname, `${pathname}.html`),
              path.resolve(dir.pathname, name),
            );

            const files = [name];

            // Copy public files to subdirectories if needed
            const pathSegments = pathname.split("/").filter(Boolean);
            if (pathSegments.length > 1) {
              const subdirPath = path.resolve(
                dir.pathname,
                ...pathSegments.slice(0, -1),
              );
              fs.mkdirSync(subdirPath, { recursive: true });

              for (const publicFile of publicFiles) {
                const targetPath = path.resolve(subdirPath, publicFile);
                const sourcePath = path.resolve(publicDir, publicFile);
                fs.copyFileSync(sourcePath, targetPath);
              }
            }

            files.push(...publicFiles);

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

/** @type {() => vite.Plugin} */
function publicAssetsPlugin() {
  return {
    name: "astro-html/public-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (!url) return next();

        const segments = url.split("/").filter(Boolean);
        const filename = segments[segments.length - 1];

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
  };
}
