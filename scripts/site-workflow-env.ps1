param(
    [string]$CheckoutPath = '.sites-runtime/source'
)

$siteCheckout = (Resolve-Path -LiteralPath $CheckoutPath -ErrorAction Stop).Path
$gitExecutable = (Get-Command git -ErrorAction Stop).Source
$gitSearch = Split-Path -Parent $gitExecutable
$gitRoot = $null
while ($gitSearch) {
    if (Test-Path -LiteralPath (Join-Path $gitSearch 'bin/bash.exe')) {
        $gitRoot = $gitSearch
        break
    }
    $parent = Split-Path -Parent $gitSearch
    if ($parent -eq $gitSearch) { break }
    $gitSearch = $parent
}
if (-not $gitRoot) {
    throw 'Git for Windows Bash is required for Sites packaging on Windows.'
}

$env:PATH = "$(Join-Path $gitRoot 'bin');$(Join-Path $gitRoot 'usr/bin');$env:PATH"
$env:TAR_OPTIONS = '--force-local'

$configCount = 0
if ($env:GIT_CONFIG_COUNT -and -not [int]::TryParse($env:GIT_CONFIG_COUNT, [ref]$configCount)) {
    throw 'GIT_CONFIG_COUNT must be an integer.'
}
$env:GIT_CONFIG_COUNT = [string]($configCount + 1)
Set-Item -Path "Env:GIT_CONFIG_KEY_$configCount" -Value 'safe.directory'
Set-Item -Path "Env:GIT_CONFIG_VALUE_$configCount" -Value $siteCheckout

Write-Host "Sites workflow environment ready for $siteCheckout"
