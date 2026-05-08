param(
  [Parameter(Mandatory = $false)]
  [string]$RepoPath = ".",
  [Parameter(Mandatory = $false)]
  [string]$Remote = "origin",
  [Parameter(Mandatory = $false)]
  [string]$Branch = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git is not installed or not available in PATH."
}

if (-not $env:SERRALE_GITHUB_PAT) {
  throw "Set SERRALE_GITHUB_PAT in the current shell before running this script."
}

Push-Location $RepoPath
try {
  $inside = (git rev-parse --is-inside-work-tree 2>$null).Trim()
  if ($inside -ne "true") {
    throw "RepoPath is not a git repository: $RepoPath"
  }

  if (-not $Branch) {
    $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
  }

  $pair = "x-access-token:{0}" -f $env:SERRALE_GITHUB_PAT
  $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
  $auth = [Convert]::ToBase64String($bytes)

  git -c "http.https://github.com/.extraheader=AUTHORIZATION: Basic $auth" push $Remote $Branch
}
finally {
  Pop-Location
}
