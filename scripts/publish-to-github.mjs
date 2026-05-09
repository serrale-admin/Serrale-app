#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER ?? "serrale-admin";
const repo = process.env.GITHUB_REPO ?? "Serrale-app";
const providedBranch = process.env.GITHUB_BRANCH;
const sourceDir = path.resolve(process.env.SOURCE_DIR ?? process.cwd());

if (!token) {
  console.error("Missing GITHUB_TOKEN environment variable.");
  process.exit(1);
}

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".expo",
  ".expo-shared",
  "dist",
  "build"
]);

async function github(pathname, { method = "GET", body } = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "serrale-mobile-publisher",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${method} ${pathname} failed: ${response.status} ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function listFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".pnpm-store")) {
      continue;
    }

    const absolute = path.join(dir, entry.name);
    const relative = path.relative(base, absolute).split(path.sep).join("/");

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        continue;
      }

      files.push(...(await listFiles(absolute, base)));
      continue;
    }

    files.push({ absolute, relative });
  }

  return files;
}

async function getDefaultBranch() {
  const metadata = await github(`/repos/${owner}/${repo}`);
  return metadata.default_branch;
}

async function main() {
  const files = await listFiles(sourceDir);
  const branch = providedBranch ?? (await getDefaultBranch());

  if (files.length === 0) {
    throw new Error("No files found to publish.");
  }

  const currentRef = await github(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  const currentCommitSha = currentRef.object.sha;
  const currentCommit = await github(`/repos/${owner}/${repo}/git/commits/${currentCommitSha}`);

  const tree = await Promise.all(
    files.map(async ({ absolute, relative }) => ({
      path: relative,
      mode: "100644",
      type: "blob",
      content: await fs.readFile(absolute, "utf8")
    }))
  );

  const createdTree = await github(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: {
      tree
    }
  });

  const createdCommit = await github(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: {
      message: "chore: replace repo with SERRALE mobile monorepo",
      tree: createdTree.sha,
      parents: [currentCommit.sha]
    }
  });

  await github(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: {
      sha: createdCommit.sha,
      force: false
    }
  });

  console.log(
    `Published ${files.length} files to ${owner}/${repo}@${branch} in commit ${createdCommit.sha.slice(0, 10)}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
