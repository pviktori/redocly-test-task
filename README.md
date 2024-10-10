# GitHub Package.json Updater

This script automates the process of updating the `package.json` file in a GitHub repository by adding or updating a package version. It creates a new branch, commits the changes, and opens a pull request.

## Prerequisites

Ensure that the following environment variables are set in your `.env` file:

- `GITHUB_REPO`: The name of the repository (e.g., `my-repo`).
- `GITHUB_ACCESS_TOKEN`: A GitHub personal access token with repo permissions.
- `GITHUB_OWNER`: The GitHub username or organization that owns the repository.
- `GITHUB_EMAIL`: The email address associated with the GitHub account.

### Example `.env` file

```bash
GITHUB_REPO=my-repo
GITHUB_ACCESS_TOKEN=your-access-token
GITHUB_OWNER=your-username
GITHUB_EMAIL=your-email@example.com
```

### Usage

Install dependencies

```bash
npm i
```

Run the script with the package name and version as arguments:

```bash
node index.js <package-name> <package-version>
```
