# PowerShell script to update imports in all JavaScript files

$rootPath = "d:\frontend 1\frontend-nextjs\src"

# Get all .js and .jsx files
$files = Get-ChildItem -Path $rootPath -Filter "*.js*" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Add 'use client' directive if file uses hooks or context
    if ($content -match "(useState|useEffect|useContext|useRef|useReducer|useCallback|useMemo|useAppContext)" -and 
        $content -notmatch "^[`r`n]*'use client'") {
        $content = "'use client'`n`n" + $content
    }
    
    # Replace relative imports with @ alias
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/context\/", "from '@/context/"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/components\/", "from '@/components/"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/utils\/", "from '@/utils/"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/config\/", "from '@/config/"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/pages\/", "from '@/pages/"
    
    # Two levels up
    $content = $content -replace "from ['\`"]\.\.\/context\/", "from '@/context/"
    $content = $content -replace "from ['\`"]\.\.\/components\/", "from '@/components/"
    $content = $content -replace "from ['\`"]\.\.\/utils\/", "from '@/utils/"
    $content = $content -replace "from ['\`"]\.\.\/config\/", "from '@/config/"
    $content = $content -replace "from ['\`"]\.\.\/pages\/", "from '@/pages/"
    
    # One level up for subdirectories
    $content = $content -replace "from ['\`"]\.\.\/common\/", "from '@/components/common/"
    $content = $content -replace "from ['\`"]\.\.\/layouts\/", "from '@/components/layouts/"
    $content = $content -replace "from ['\`"]\.\.\/ui\/", "from '@/components/ui/"
    $content = $content -replace "from ['\`"]\.\.\/auth\/", "from '@/components/auth/"
    $content = $content -replace "from ['\`"]\.\.\/chat\/", "from '@/components/chat/"
    $content = $content -replace "from ['\`"]\.\.\/dashboard\/", "from '@/components/dashboard/"
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nAll files updated successfully!"
