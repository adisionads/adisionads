Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path "public/icons" | Out-Null

$srcPath = Resolve-Path "public/brand/logo-square.jpg"
$bmp = [System.Drawing.Image]::FromFile($srcPath)

# 192x192
$canvas192 = New-Object System.Drawing.Bitmap 192, 192
$gfx192 = [System.Drawing.Graphics]::FromImage($canvas192)
$gfx192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx192.DrawImage($bmp, 0, 0, 192, 192)
$canvas192.Save("public/icons/icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 512x512
$canvas512 = New-Object System.Drawing.Bitmap 512, 512
$gfx512 = [System.Drawing.Graphics]::FromImage($canvas512)
$gfx512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx512.DrawImage($bmp, 0, 0, 512, 512)
$canvas512.Save("public/icons/icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Apple Touch Icon (180x180)
$canvas180 = New-Object System.Drawing.Bitmap 180, 180
$gfx180 = [System.Drawing.Graphics]::FromImage($canvas180)
$gfx180.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx180.DrawImage($bmp, 0, 0, 180, 180)
$canvas180.Save("public/icons/apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$gfx192.Dispose()
$canvas192.Dispose()
$gfx512.Dispose()
$canvas512.Dispose()
$gfx180.Dispose()
$canvas180.Dispose()
$bmp.Dispose()

Write-Host "Icons generated successfully!"
