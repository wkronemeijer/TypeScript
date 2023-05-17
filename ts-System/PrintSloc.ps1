
$here = "$PSScriptRoot"
$directory = "src"
$extension = ".ts"

$target = "$here\$directory\*$extension"
$lines = (Get-ChildItem -Recurse $target | Get-Content | Measure-Object -Line).Lines
Write-Host ".\$directory contains $lines lines of $extension source code"
