param(
  [int]$IntervalSeconds = 20,
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

# Validate repository context before entering the sync loop.
$insideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $insideRepo -ne "true") {
  Write-Error "Current directory is not a git repository."
  exit 1
}

$remoteName = "origin"
$remoteExists = git remote | Where-Object { $_ -eq $remoteName }
if (-not $remoteExists) {
  Write-Error "Remote '$remoteName' is not configured."
  exit 1
}

Write-Host "Auto-sync started for $remoteName/$Branch in $repoRoot"
Write-Host "Checking for changes every $IntervalSeconds seconds..."

while ($true) {
  $status = git status --porcelain

  if (-not [string]::IsNullOrWhiteSpace($status)) {
    git add -A

    git diff --cached --quiet
    $hasStagedChanges = ($LASTEXITCODE -eq 1)

    if ($hasStagedChanges) {
      $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      $message = "chore: auto-sync $timestamp"

      git commit -m $message | Out-Host

      if ($LASTEXITCODE -eq 0) {
        git push $remoteName $Branch | Out-Host

        if ($LASTEXITCODE -eq 0) {
          Write-Host "[OK] Synced at $timestamp"
        } else {
          Write-Warning "Push failed. Will retry on next cycle."
        }
      }
    }
  }

  Start-Sleep -Seconds $IntervalSeconds
}
