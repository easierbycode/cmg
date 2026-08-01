// "Add to CodeMonkey" button for GitHub repo pages, ported from
// codemonkey-games-launcher's scripts/content.js. Clicking it builds a
// codemonkey://add?… deep link (see lib/protocol.ts for the contract) and
// navigates to it; the OS-registered protocol handler — the compiled launcher,
// wired up by `deno task register:windows:protocol` — receives the link and
// installs the game.
//
// Divergences from upstream, on purpose:
//   - the repo is sent as its canonical https://github.com/<owner>/<name> URL
//     derived from the path, not location.href — so deep pages (/tree/…,
//     /blob/…) produce a clean repo link, and /tree/<branch> pre-fills the
//     branch prompt.
//   - the button only appears on repo-shaped paths instead of every GitHub
//     page whose header matched a selector.
//   - one button builder serves both mount points (upstream duplicated it).
//   - before navigating, the chosen link is announced as a "cmg-launcher-url"
//     CustomEvent on document. The browser-to-OS hop is invisible to page
//     script, so this is the observation point the protocol E2E test hooks;
//     on real GitHub nothing listens and it is inert.

const BUTTON_ID = "codemonkey-launcher-button";

// Top-level GitHub paths that are never repositories.
const NON_REPO_OWNERS = new Set([
  "about",
  "codespaces",
  "collections",
  "contact",
  "enterprise",
  "explore",
  "features",
  "issues",
  "login",
  "join",
  "marketplace",
  "notifications",
  "orgs",
  "pricing",
  "pulls",
  "search",
  "settings",
  "sponsors",
  "topics",
  "trending",
]);

// { owner, name, branch } for repo-shaped paths, else null. A
// /tree/<branch> path carries the branch the visitor is looking at.
function repoFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const [owner, name] = segments;
  if (NON_REPO_OWNERS.has(owner.toLowerCase())) return null;
  let branch = "main";
  if (segments[2] === "tree" && segments[3]) {
    branch = decodeURIComponent(segments[3]);
  }
  return { owner, name, branch };
}

function buildLauncherUrl(repoUrl, branch, folder) {
  const params = new URLSearchParams({
    repo: repoUrl,
    branch: branch,
    folder: folder,
  });
  return `codemonkey://add?${params}`;
}

function onButtonClick() {
  const repo = repoFromPath(location.pathname);
  if (!repo) return;

  const branch = prompt(
    "Enter the branch name (e.g., main, master):",
    repo.branch,
  );
  if (branch === null) return; // user cancelled

  const folder = prompt(
    "Enter the folder path (e.g., docs, dist), or leave empty for root:",
    "",
  );
  if (folder === null) return;

  const launcherUrl = buildLauncherUrl(
    `https://github.com/${repo.owner}/${repo.name}`,
    branch,
    folder,
  );

  // Announce before navigating — the codemonkey:// navigation leaves no trace
  // page script can see, so tests (and curious consoles) get the link here.
  document.dispatchEvent(
    new CustomEvent("cmg-launcher-url", { detail: launcherUrl }),
  );
  location.assign(launcherUrl);
}

function createButton(floating) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = BUTTON_ID;
  button.innerText = floating ? "🐵 Add to CodeMonkey" : "Add to CodeMonkey";
  button.style.backgroundColor = "#2da44e";
  button.style.color = "white";
  button.style.border = "1px solid rgba(27,31,36,0.15)";
  button.style.borderRadius = "6px";
  button.style.cursor = "pointer";
  if (floating) {
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = "9999";
    button.style.padding = "8px 16px";
    button.style.fontSize = "14px";
    button.style.fontWeight = "500";
  } else {
    button.className = "btn btn-sm";
    button.style.marginLeft = "8px";
    button.style.padding = "5px 16px";
  }
  button.addEventListener("click", onButtonClick);
  return button;
}

function addButton() {
  if (document.getElementById(BUTTON_ID)) return; // already mounted
  if (!repoFromPath(location.pathname)) return; // not a repo page

  // GitHub ships several header layouts; try the action areas first.
  const buttonGroup = document.querySelector(".gh-action-menu-group") ||
    document.querySelector('[data-testid="repository-actions"]') ||
    document.querySelector(".d-flex.gap-2") ||
    document.querySelector("div.d-flex > span.d-none.d-md-flex");
  if (buttonGroup) {
    buttonGroup.appendChild(createButton(false));
    return;
  }

  // Fallback: float over the repository header.
  const repoHeader = document.querySelector("#repository-container-header") ||
    document.querySelector("div[data-hpc] > div > div");
  if (repoHeader) {
    document.body.appendChild(createButton(true));
  }
}

// GitHub is a soft-navigating SPA — re-check on DOM changes. addButton() is
// idempotent, so observing broadly is safe.
const observer = new MutationObserver(() => {
  addButton();
});
observer.observe(document.body, { childList: true, subtree: true });

addButton();
