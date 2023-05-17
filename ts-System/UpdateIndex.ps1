$here = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Push-Location $here\src
    #############
    ### BEGIN ###
    #############
    
    $extension = ".ts";
    $target = "$here\src\Modules.generated$extension"
    
    $modules = @(
        Get-ChildItem -Filter "*$extension" -Recurse -File |
        Select -Expand FullName |
        Resolve-Path -Relative |
        ForEach-Object { $_.Substring(0, $_.Length - $extension.Length) } |
        ForEach-Object { $_.Replace("\", "/") } |
        Where-Object   { $_ -ne "./index" } |
        ForEach-Object { "export * from `"" + $_ + "`";" }
    )
    
    $newline = "`n"
    $output = [string]::Join("`n", @(
        "// [UpdateIndex.ps1] Generated on $(Get-Date -Format "s").",
        "// [UpdateIndex.ps1] Bundles $($modules.Length) modules.",
        "// `"Toggle comment to improve development.`"() /*",
        [string]::Join("`n", $modules),
        "//*/"
    ))
    
    Out-File -FilePath $target -InputObject $output
    
    ###########
    ### END ###
    ###########
Pop-Location
