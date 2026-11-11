# Publie HackLab Academy sur GitHub et active GitHub Pages.
# Prerequis : Git installe, un jeton personnel GitHub avec les droits
# "repo" et "workflow" (jeton classique) ou Contents/Pages/Workflows en écriture.
# Le jeton n'est jamais écrit sur le disque ni dans la configuration Git.

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$owner = Read-Host "Compte GitHub (defaut : abdounh)"
if ([string]::IsNullOrWhiteSpace($owner)) { $owner = "abdounh" }

$repo = Read-Host "Nom du depot (defaut : hacklab-academy)"
if ([string]::IsNullOrWhiteSpace($repo)) { $repo = "hacklab-academy" }

$secure = Read-Host "Collez votre jeton GitHub (repo + workflow)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
if ([string]::IsNullOrWhiteSpace($token)) { throw "Jeton vide : publication annulee." }

$headers = @{
  Authorization = "Bearer $token"
  Accept = "application/vnd.github+json"
  "User-Agent" = "hacklab-academy-publisher"
}
$api = "https://api.github.com"
$repoUri = "$api/repos/$owner/$repo"

function Invoke-Api {
  param([string]$Method, [string]$Uri, [string]$Body)
  if ($Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -ContentType "application/json" -Body $Body
  }
  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers
}

function Get-StatusCode {
  param($ErrorRecord)
  if ($ErrorRecord.Exception.Response -and $ErrorRecord.Exception.Response.StatusCode) {
    return [int]$ErrorRecord.Exception.Response.StatusCode
  }
  return 0
}

Write-Host "1/5 Verification du depot $owner/$repo..."
$exists = $false
try {
  Invoke-Api GET $repoUri | Out-Null
  $exists = $true
} catch {
  if ((Get-StatusCode $_) -ne 404) { throw }
}

if (-not $exists) {
  Write-Host "Creation du depot public..."
  $body = @{
    name = $repo
    private = $false
    description = "Plateforme pedagogique de cybersecurite avec labs vulnerables"
    has_issues = $true
    has_wiki = $false
  } | ConvertTo-Json
  Invoke-Api POST "$api/user/repos" $body | Out-Null
}

Write-Host "2/5 Preparation du depot local..."
if (-not (Test-Path ".git")) { git init -b main | Out-Null }
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  git remote set-url origin "https://github.com/$owner/$repo.git"
} else {
  git remote add origin "https://github.com/$owner/$repo.git"
}
git branch -M main | Out-Null
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Update HackLab Academy" | Out-Null
}

Write-Host "3/5 Envoi du code source..."
# Authentification en memoire uniquement : le jeton n'est pas stocke dans .git/config.
$pair = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$owner`:$token"))
git -c "http.extraheader=AUTHORIZATION: Basic $pair" push -u origin main
if ($LASTEXITCODE -ne 0) {
  throw "Le push a echoue. Verifiez que le jeton possede les droits repo + workflow."
}
$pair = $null

Write-Host "4/5 Activation de GitHub Pages..."
try {
  $pages = Invoke-Api GET "$repoUri/pages"
  if ($pages.build_type -ne "workflow") {
    Invoke-Api PUT "$repoUri/pages" '{"build_type":"workflow"}' | Out-Null
  }
} catch {
  if ((Get-StatusCode $_) -eq 404) {
    Invoke-Api POST "$repoUri/pages" '{"build_type":"workflow"}' | Out-Null
  } else {
    throw
  }
}

Write-Host "5/5 Lancement du deploiement..."
Start-Sleep -Seconds 2
Invoke-Api POST "$repoUri/actions/workflows/pages.yml/dispatches" '{"ref":"main"}' | Out-Null

$siteUrl = "https://$owner.github.io/$repo/"
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 10
  try {
    $runs = Invoke-Api GET "$repoUri/actions/workflows/pages.yml/runs?per_page=1"
    $run = $runs.workflow_runs[0]
    if ($run.status -eq "completed") {
      if ($run.conclusion -eq "success") {
        Write-Host ""
        Write-Host "Publication terminee : $siteUrl"
        Write-Host "Depot : https://github.com/$owner/$repo"
      } else {
        Write-Host "Le workflow s'est termine avec le statut : $($run.conclusion)"
        Write-Host "Details : $($run.html_url)"
      }
      break
    }
    Write-Host "Deploiement en cours ($($run.status))..."
  } catch {
    Write-Host "Verification du deploiement en attente..."
  }
}

$token = $null
