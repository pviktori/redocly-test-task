import { Octokit } from "octokit";
import dotenv from "dotenv";
dotenv.config();

// TODO: allow multiple configuration updates
const [, , packageName, packageVersion] = process.argv;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const sourceBranchName = "update-packagejson";
const targetBranchName = "main";
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_EMAIL = process.env.GITHUB_EMAIL;
const defaultGithubSettings = {
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

const octokit = new Octokit({
  auth: GITHUB_ACCESS_TOKEN,
});

const getOriginalFile = async () => {
  const { data: fileData } = await octokit.request(`GET /repos/{owner}/{repo}/contents/package.json`, {
    ...defaultGithubSettings,
    path: "package.json",
  });
  return fileData;
};

const updateOriginalFile = async () => {
  const { content, sha } = await getOriginalFile();
  const packageJson = JSON.parse(Buffer.from(content, "base64").toString());

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  packageJson.dependencies[packageName] = packageVersion;

  console.log("File is updated!");
  return { content: packageJson, sha };
};

const createBranch = async () => {
  const response = await octokit.request(`GET /repos/{owner}/{repo}/git/refs`, {
    ...defaultGithubSettings,
  });

  await octokit.request(`POST /repos/{owner}/{repo}/git/refs`, {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    ref: `refs/heads/${sourceBranchName}`,
    sha: response.data[0].object.sha,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  console.log("Branch is created!");
};

const createCommit = async () => {
  const { content, sha } = await updateOriginalFile();
  await createBranch(sha);

  await octokit.request(`PUT /repos/{owner}/{repo}/contents/package.json`, {
    ...defaultGithubSettings,
    message: "Update Package.json",
    author: {
      name: GITHUB_OWNER,
      email: GITHUB_EMAIL,
      date: new Date().toISOString(),
    },
    content: btoa(JSON.stringify(content, null, 2)),
    branch: sourceBranchName,
    sha,
  });

  console.log("Commit is created!");
};

const createPullRequest = async () => {
  await createCommit();
  await octokit.request(`POST /repos/{owner}/{repo}/pulls`, {
    ...defaultGithubSettings,
    title: "Update Package.json",
    message: "Update Package.json",
    body: "Please pull these awesome changes in!",
    head: sourceBranchName,
    base: targetBranchName,
  });

  console.log("Pull Request is created!");
};

createPullRequest();
