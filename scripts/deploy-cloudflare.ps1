$ErrorActionPreference = "Stop"

$projectPath = "D:\Coding\cookin"
$productionConfigPath = Join-Path $projectPath "wrangler.production.jsonc"
$installedScriptPath = Join-Path $projectPath "scripts\deploy-cloudflare.ps1"

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Description,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "==> $Description" -ForegroundColor Cyan
    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE."
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $projectPath "package.json"))) {
    throw "Cookin was not found at $projectPath."
}

Set-Location -LiteralPath $projectPath
$env:XDG_CONFIG_HOME = Join-Path $projectPath ".wrangler\config"

Invoke-Checked "Checking Cloudflare sign-in" {
    npx wrangler whoami
}

Write-Host ""
Write-Host "==> Looking for an existing Cookin database" -ForegroundColor Cyan
$databaseListOutput = & npx wrangler d1 list --json

if ($LASTEXITCODE -ne 0) {
    throw "Reading the Cloudflare D1 database list failed with exit code $LASTEXITCODE."
}

$databaseList = @(
    (($databaseListOutput -join [Environment]::NewLine) | ConvertFrom-Json)
)
$existingDatabase = $databaseList |
    Where-Object { $_.name -eq "cookin-recipes-db" } |
    Select-Object -First 1

$d1Binding = [ordered]@{
    binding = "DB"
}

if ($null -ne $existingDatabase) {
    $databaseId = $existingDatabase.uuid

    if ([string]::IsNullOrWhiteSpace($databaseId)) {
        $databaseId = $existingDatabase.id
    }

    if ([string]::IsNullOrWhiteSpace($databaseId)) {
        $databaseId = $existingDatabase.database_id
    }

    if ([string]::IsNullOrWhiteSpace($databaseId)) {
        throw "Cookin's existing D1 database was found, but its ID was missing."
    }

    $d1Binding.database_name = "cookin-recipes-db"
    $d1Binding.database_id = $databaseId
    Write-Host "Reusing the existing cookin-recipes-db database." -ForegroundColor Green
}

$d1Binding.migrations_dir = "drizzle"

$productionConfigObject = [ordered]@{
    '$schema' = "./node_modules/wrangler/config-schema.json"
    name = "cookin-recipes"
    main = ".open-next/worker.js"
    compatibility_date = "2026-07-30"
    compatibility_flags = @("nodejs_compat")
    assets = [ordered]@{
        directory = ".open-next/assets"
        binding = "ASSETS"
    }
    d1_databases = @($d1Binding)
    r2_buckets = @(
        [ordered]@{
            binding = "PHOTOS"
        }
    )
    observability = [ordered]@{
        enabled = $true
        head_sampling_rate = 1
    }
}

$productionConfig = $productionConfigObject | ConvertTo-Json -Depth 10

if (Test-Path -LiteralPath $productionConfigPath) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "$productionConfigPath.$timestamp.bak"
    Copy-Item -LiteralPath $productionConfigPath -Destination $backupPath
    Write-Host "Backed up the previous production config to $backupPath"
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText(
    $productionConfigPath,
    $productionConfig,
    $utf8WithoutBom
)

# Keep a reusable copy in the project for future deployments.
if ($PSCommandPath -ne $installedScriptPath) {
    if (Test-Path -LiteralPath $installedScriptPath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        Copy-Item -LiteralPath $installedScriptPath -Destination "$installedScriptPath.$timestamp.bak"
    }

    Copy-Item -LiteralPath $PSCommandPath -Destination $installedScriptPath
}

Invoke-Checked "Building Cookin for Cloudflare Workers" {
    npx opennextjs-cloudflare build
}

Write-Host ""
Write-Host "Cloudflare may ask you to enable R2 billing." -ForegroundColor Yellow
Write-Host "R2 includes a free monthly allowance, but Cloudflare may require a payment method." -ForegroundColor Yellow

Invoke-Checked "Creating Cookin's resources and deploying the Worker" {
    npx wrangler deploy --config wrangler.production.jsonc --message "Independent Cookin deployment"
}

Invoke-Checked "Applying Cookin's database schema" {
    npx wrangler d1 migrations apply DB --remote --config wrangler.production.jsonc
}

Invoke-Checked "Verifying the remote recipe database" {
    npx wrangler d1 execute DB --remote --config wrangler.production.jsonc --command "SELECT COUNT(*) AS recipe_count FROM Recipe"
}

Write-Host ""
Write-Host "Cookin is deployed independently." -ForegroundColor Green
Write-Host ""
Write-Host "Final privacy step:" -ForegroundColor Cyan
Write-Host "1. Open Cloudflare Dashboard > Workers & Pages > cookin-recipes."
Write-Host "2. Open Settings > Domains & Routes."
Write-Host "3. Beside the workers.dev URL, choose Enable Cloudflare Access."
Write-Host "4. Allow only your own email address."
Write-Host ""
Write-Host "Do not remove the old ChatGPT Sites deployment until the new private URL is tested."
