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
          name: "astro-email/react",
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
          entrypoint: "astro-email/index.astro",
        });

        addDevToolbarApp("astro-email/toolbar.js");
      },
      "astro:build:done": async ({ dir, pages }) => {
        if (options.filename) {
          const manifest = [];

          for (const page of pages) {
            const pathname = page.pathname || "index";
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
        server.ws.on("astro-dev-toolbar:astro-email:toggled", (data) => {
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
    name: "astro-email/react:opts",
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
