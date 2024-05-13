import * as esbuild from "esbuild";

await esbuild.build({
	entryPoints: ["src/extension.ts"],
	bundle: true,
	sourcemap: true,
	platform: "node",
	outfile: "dist/extension.js",
	external: ["vscode"],
});
