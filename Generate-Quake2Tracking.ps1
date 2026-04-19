param(
    [Parameter(Mandatory = $true)]
    [string]$RepoPath,

    [Parameter(Mandatory = $false)]
    [string]$OutputFile = "QUAKE2_FILE_TRACKING.md"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RelativePathCompat {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $baseFullPath = [System.IO.Path]::GetFullPath($BasePath)
    $targetFullPath = [System.IO.Path]::GetFullPath($TargetPath)

    if (-not $baseFullPath.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $baseFullPath += [System.IO.Path]::DirectorySeparatorChar
    }

    $baseUri = New-Object System.Uri($baseFullPath)
    $targetUri = New-Object System.Uri($targetFullPath)
    $relativeUri = $baseUri.MakeRelativeUri($targetUri)
    $relativePath = [System.Uri]::UnescapeDataString($relativeUri.ToString())

    return $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
}

function Escape-MarkdownText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text
    )

    return $Text.Replace("|", "\|")
}

function Should-ExcludePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FullPath,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    foreach ($dirName in $ExcludedDirectoryNames) {
        $pattern = [System.IO.Path]::DirectorySeparatorChar + $dirName + [System.IO.Path]::DirectorySeparatorChar
        if ($FullPath -like "*$pattern*") {
            return $true
        }
    }

    return $false
}

if (-not (Test-Path -LiteralPath $RepoPath)) {
    throw "Le chemin du depot n'existe pas : $RepoPath"
}

$resolvedRepoPath = (Resolve-Path -LiteralPath $RepoPath).Path

if (-not (Test-Path -LiteralPath $resolvedRepoPath -PathType Container)) {
    throw "Le chemin fourni n'est pas un dossier : $resolvedRepoPath"
}

if ([System.IO.Path]::IsPathRooted($OutputFile)) {
    $outputPath = $OutputFile
}
else {
    $outputPath = Join-Path -Path $resolvedRepoPath -ChildPath $OutputFile
}

$excludedDirectoryNames = @(
    ".git",
    ".github",
    ".vs",
    ".vscode",
    "bin",
    "obj",
    "node_modules"
)

$files = Get-ChildItem -LiteralPath $resolvedRepoPath -Recurse -File -Force |
    Where-Object {
        $fullPath = $_.FullName

        if ($fullPath -eq $outputPath) {
            return $false
        }

        if (Should-ExcludePath -FullPath $fullPath -ExcludedDirectoryNames $excludedDirectoryNames) {
            return $false
        }

        return $true
    } |
    Sort-Object FullName

$lines = New-Object System.Collections.Generic.List[string]

$lines.Add("# Suivi des fichiers du depot Quake 2")
$lines.Add("")
$lines.Add("Fichier genere automatiquement a partir du depot source : $resolvedRepoPath")
$lines.Add("")
$lines.Add("Les colonnes Description / role, A porter et Porte sont a completer manuellement au fur et a mesure.")
$lines.Add("")
$lines.Add("| Path | Nom | Description / role | A porter | Porte |")
$lines.Add("|---|---|---|---|---|")

foreach ($file in $files) {
    $relativePath = Get-RelativePathCompat -BasePath $resolvedRepoPath -TargetPath $file.FullName
    $name = $file.Name

    $relativePath = Escape-MarkdownText -Text $relativePath
    $name = Escape-MarkdownText -Text $name

    $lines.Add("| $relativePath | $name |  |  |  |")
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($outputPath, $lines, $utf8NoBom)

Write-Host "Fichier genere : $outputPath"
Write-Host "Nombre de fichiers listes : $($files.Count)"