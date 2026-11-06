const packageSources = {
  tauri: { type: "crate", name: "tauri", repo: "tauri-apps/tauri", tag: (version) => `tauri-v${version}` },
  tokio: { type: "crate", name: "tokio" },
  serde: { type: "crate", name: "serde" },
  tracing: { type: "crate", name: "tracing" },
  thiserror: { type: "crate", name: "thiserror" },
  anyhow: { type: "crate", name: "anyhow" },
  "mcp-server": { type: "npm", name: "@modelcontextprotocol/server" },
  "mcp-client": { type: "npm", name: "@modelcontextprotocol/client" },
  zod: { type: "npm", name: "zod" },
  "standard-schema": { type: "npm", name: "@standard-schema/spec" },
  vue: { type: "npm", name: "vue" },
  typescript: { type: "npm", name: "typescript" },
  vite: { type: "npm", name: "vite" },
  pinia: { type: "npm", name: "pinia" },
  "vue-router": { type: "npm", name: "vue-router" },
  tailwindcss: { type: "npm", name: "tailwindcss" },
};

async function readJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function readStableRust() {
  const response = await fetch("https://static.rust-lang.org/dist/channel-rust-stable.toml", {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Rust stable channel returned HTTP ${response.status}`);
  const manifest = await response.text();
  const start = manifest.indexOf("[pkg.rust]");
  if (start < 0) throw new Error("Rust stable channel has no [pkg.rust] section");
  const end = manifest.indexOf("\n[", start + 1);
  const section = manifest.slice(start, end < 0 ? undefined : end);
  const version = section.match(/^version = "(\d+\.\d+\.\d+)/m)?.[1];
  if (!version) throw new Error("Could not read rustc stable version");
  return version;
}

async function readPackageVersion(source) {
  if (source.type === "crate") {
    const data = await readJson(`https://crates.io/api/v1/crates/${source.name}`, {
      "user-agent": "tech-stack-tree-version-check/1.0 (https://github.com/phoenixlucky/tech-stack-tree)",
    });
    const version = data.crate?.max_stable_version;
    if (!version) throw new Error(`No stable version found for crate ${source.name}`);
    return version;
  }
  const data = await readJson(`https://registry.npmjs.org/${encodeURIComponent(source.name)}`);
  const version = data["dist-tags"]?.latest;
  if (!version) throw new Error(`No latest stable tag found for npm package ${source.name}`);
  return version;
}

const entries = Object.entries(packageSources);
const [rust, packageVersions] = await Promise.all([
  readStableRust(),
  Promise.all(entries.map(async ([key, source]) => [key, await readPackageVersion(source)])),
]);
const versions = Object.fromEntries([["rust", rust], ...packageVersions]);
const { readFile, writeFile } = await import("node:fs/promises");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const baseline = Object.fromEntries([...html.matchAll(/data-package="([^"]+)"[^>]*data-version="([^"]+)"/g)].map((match) => [match[1], match[2]]));

const releaseSources = {
  rust: { repo: "rust-lang/rust", tag: (version) => version, compareTag: (version) => version, changelog: "https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md", compare: "https://github.com/rust-lang/rust/compare" },
  tauri: { repo: "tauri-apps/tauri", tag: (version) => `tauri-v${version}`, compareTag: (version) => `tauri-v${version}`, changelog: "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri/CHANGELOG.md", compare: "https://github.com/tauri-apps/tauri/compare" },
  tokio: { repo: "tokio-rs/tokio" },
  serde: { repo: "serde-rs/serde" },
  tracing: { repo: "tokio-rs/tracing" },
  thiserror: { repo: "dtolnay/thiserror" },
  anyhow: { repo: "dtolnay/anyhow" },
  "mcp-server": { repo: "modelcontextprotocol/typescript-sdk" },
  "mcp-client": { repo: "modelcontextprotocol/typescript-sdk" },
  zod: { repo: "colinhacks/zod" },
  "standard-schema": { repo: "standard-schema/standard-schema" },
  vue: { repo: "vuejs/core", changelog: "https://raw.githubusercontent.com/vuejs/core/main/CHANGELOG.md", compare: "https://github.com/vuejs/core/compare" },
  typescript: { repo: "microsoft/typescript-go", tag: (version) => `typescript/v${version}`, compareTag: (version) => `typescript/v${version}` },
  vite: { repo: "vitejs/vite", changelog: "https://raw.githubusercontent.com/vitejs/vite/main/packages/vite/CHANGELOG.md", compare: "https://github.com/vitejs/vite/compare" },
  pinia: { repo: "vuejs/pinia", changelog: "https://raw.githubusercontent.com/vuejs/pinia/v4/packages/pinia/CHANGELOG.md", compare: "https://github.com/vuejs/pinia/compare" },
  "vue-router": { repo: "vuejs/router", changelog: "https://raw.githubusercontent.com/vuejs/router/main/packages/router/CHANGELOG.md", compare: "https://github.com/vuejs/router/compare" },
  tailwindcss: { repo: "tailwindlabs/tailwindcss", changelog: "https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/CHANGELOG.md", compare: "https://github.com/tailwindlabs/tailwindcss/compare" },
};

function compareVersions(left, right) {
  const a = left.match(/^(\d+(?:\.\d+){0,3})/)?.[1].split(".").map(Number) ?? [];
  const b = right.match(/^(\d+(?:\.\d+){0,3})/)?.[1].split(".").map(Number) ?? [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

function versionHeading(text, version) {
  text = text.replace(/<[^>]+>/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^(Version \d)/gm, "## $1");
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^(#{1,3})\\s+\\[?(?:v|Version )?${escaped}(?:\\]|\\s|$).*?$`, "m");
  const match = pattern.exec(text);
  if (!match) return null;
  const start = match.index;
  const headingLevel = match[1].length;
  const nextHeading = new RegExp(`^#{1,${headingLevel}}\\s+`, "gm");
  nextHeading.lastIndex = start + match[0].length;
  const next = nextHeading.exec(text);
  const body = text.slice(start + match[0].length, next?.index).trim();
  return body ? body.split("\n").filter((line) => line.trim()).slice(0, 8).join("\n").slice(0, 1100) : null;
}

async function releaseNote(key, version, compareFrom, compareTo) {
  const source = releaseSources[key];
  if (!source) return { summary: "该项目未提供可自动读取的独立发布说明。", url: `https://github.com/search?q=${encodeURIComponent(`${key} ${version} changelog`)}&type=repositories`, available: false };
  if (key === "typescript" && version === "6.0.3") return { summary: "6.0.3 是 6.0 系列补丁版：以维护修复为主，保留 JavaScript/TypeScript 编译器与语言服务的原有架构。", url: "https://github.com/microsoft/TypeScript/releases/tag/v6.0.3", available: true };
  if (key === "typescript" && version === "7.0.2") return { summary: "7.0 将编译器与工具移植到原生 Go，官方大型项目构建测试约快 8–12 倍，并改进多线程与 watch。它尚未提供稳定编程 API；Vue 等依赖嵌入式 TS 服务的工作流仍需 6.0。", url: "https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/", available: true };
  if (source.changelog) {
    try {
      const response = await fetch(source.changelog, { signal: AbortSignal.timeout(20000) });
      if (response.ok) {
        const changelog = await response.text();
        const summary = versionHeading(changelog, version);
        if (summary) return { summary, url: source.changelog.replace("raw.githubusercontent.com", "github.com").replace("/main/", "/blob/main/"), available: true };
      }
    } catch {}
  }
  if (source.repo) {
    const tag = source.tag ? source.tag(version) : `v${version}`;
    const headers = { "user-agent": "tech-stack-tree-version-check/1.0" };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    try {
      const release = await readJson(`https://api.github.com/repos/${source.repo}/releases/tags/${encodeURIComponent(tag)}`, headers);
      if (release.body?.trim()) return { summary: release.body.trim().split("\n").filter((line) => line.trim()).slice(0, 8).join("\n").slice(0, 1100), url: release.html_url, available: true };
    } catch {}
  }
  const oldTag = source.compareTag ? source.compareTag(compareFrom) : `v${compareFrom}`;
  const newTag = source.compareTag ? source.compareTag(compareTo) : `v${compareTo}`;
  const compare = source.compare ?? `https://github.com/${source.repo}/compare`;
  return { summary: "该版本没有独立发布说明摘要，可打开上游版本差异查看提交与改动。", url: `${compare}/${encodeURIComponent(oldTag)}...${encodeURIComponent(newTag)}`, available: false };
}

const updates = Object.entries(versions).filter(([key, latest]) => baseline[key] && compareVersions(latest, baseline[key]) > 0);
const comparisons = Object.fromEntries(await Promise.all(updates.map(async ([key, latest]) => {
  const source = releaseSources[key];
  const oldVersion = baseline[key];
  if (!source) return [key, { old: { version: oldVersion, summary: "此版本的独立发布说明暂不可自动读取。", url: `https://www.npmjs.com/package/${packageSources[key]?.name ?? key}/v/${oldVersion}` }, latest: { version: latest, summary: "此版本的独立发布说明暂不可自动读取。", url: `https://www.npmjs.com/package/${packageSources[key]?.name ?? key}/v/${latest}` } }];
  const [oldNote, newNote] = await Promise.all([releaseNote(key, oldVersion, oldVersion, latest), releaseNote(key, latest, oldVersion, latest)]);
  return [key, { old: { version: oldVersion, ...oldNote }, latest: { version: latest, ...newNote } }];
})));
const snapshot = { checkedAt: new Date().toISOString(), versions, comparisons };
await writeFile(new URL("../latest-versions.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(`Recorded ${Object.keys(versions).length} stable versions at ${snapshot.checkedAt}\n`);


