# PowerShell script to add 'use client' to remaining files that need it

$rootPath = "d:\frontend 1\frontend-nextjs\src\pages"

# Get all .js files in pages directory
$files = Get-ChildItem -Path $rootPath -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Check if file doesn't have 'use client' and is a component (has export default)
    if ($content -match "export default" -and $content -notmatch "^[`r`n]*'use client'") {
        $content = "'use client'`n`n" + $content
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Added 'use client' to: $($file.FullName)"
    }
}

Write-Host "`nAll pages updated successfully!"
