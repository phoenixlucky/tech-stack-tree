const notice = document.querySelector("#version-notice");
const summary = document.querySelector("#version-summary");
const meta = document.querySelector("#version-meta");
const list = document.querySelector("#version-update-list");

function compareVersions(left, right) {
  const parse = (value) => {
    const match = value.match(/^v?(\d+(?:\.\d+){0,3})(?:[-+].*)?$/);
    return match ? match[1].split(".").map(Number) : null;
  };
  const a = parse(left);
  const b = parse(right);
  if (!a || !b) return 0;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

function makeReleaseCard(label, release) {
  const section = document.createElement("section");
  section.className = "release-card";
  const heading = document.createElement("h4");
  heading.textContent = `${label} ${release?.version ?? ""}`.trim();
  const summary = document.createElement("p");
  summary.textContent = (release?.summary ?? "该版本的发布说明暂不可用。")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ");
  section.append(heading, summary);
  if (release?.url) {
    const link = document.createElement("a");
    link.href = release.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "查看上游说明 / 差异 →";
    section.append(link);
  }
  return section;
}

function makeUpdateItem(entry, comparison) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = entry.url;
  link.textContent = entry.name;
  const arrow = document.createElement("span");
  arrow.className = "version-arrow";
  arrow.textContent = `${entry.current} → ${entry.latest}`;
  const top = document.createElement("div");
  top.className = "version-update-top";
  top.append(link, arrow);
  const details = document.createElement("details");
  details.className = "version-compare";
  const toggle = document.createElement("summary");
  toggle.textContent = "新旧版特性对比";
  const grid = document.createElement("div");
  grid.className = "release-compare-grid";
  grid.append(makeReleaseCard("旧版", comparison?.old), makeReleaseCard("新版", comparison?.latest));
  details.append(toggle, grid);
  item.append(top, details);
  return item;
}

async function showVersionStatus() {
  notice.hidden = false;
  try {
    const response = await fetch("./latest-versions.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const snapshot = await response.json();
    const checkedAt = new Date(snapshot.checkedAt);
    if (Number.isNaN(checkedAt.getTime()) || !snapshot.versions) throw new Error("Invalid version snapshot");

    const updates = [];
    document.querySelectorAll(".versioned[data-package][data-version]").forEach((node) => {
      const latest = snapshot.versions[node.dataset.package];
      if (typeof latest !== "string" || compareVersions(latest, node.dataset.version) <= 0) return;
      const name = node.dataset.packageName || node.dataset.package;
      const badge = document.createElement("span");
      badge.className = "new-version";
      badge.textContent = `新版 ${latest}`;
      node.append(badge);
      node.setAttribute("aria-label", `${name}，当前标注 ${node.dataset.version}，最新稳定版 ${latest}`);
      updates.push({ package: node.dataset.package, name, current: node.dataset.version, latest, url: node.dataset.packageUrl });
    });

    list.replaceChildren(...updates.map((entry) => makeUpdateItem(entry, snapshot.comparisons?.[entry.package])));
    notice.classList.toggle("version-status-current", updates.length === 0);
    notice.classList.remove("version-status-error");
    summary.textContent = updates.length ? `发现 ${updates.length} 项可更新版本` : "当前标注版本均为最新稳定版";
    meta.textContent = `稳定版检查时间：${checkedAt.toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })}。此提醒只提示新版本，不会自动修改项目版本。`;
  } catch {
    notice.classList.add("version-status-error");
    summary.textContent = "版本检查暂不可用";
    meta.textContent = "版本源暂时无法读取，请稍后再访问；当前技术栈标注保持不变。";
    list.replaceChildren();
  }
}

showVersionStatus();


