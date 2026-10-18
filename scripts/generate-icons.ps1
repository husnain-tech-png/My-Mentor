Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size

    # Background gradient
    $color1 = [System.Drawing.Color]::FromArgb(255, 99, 102, 241)  # #6366f1
    $color2 = [System.Drawing.Color]::FromArgb(255, 129, 140, 248) # #818cf8
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $color2, $color1, 45.0

    if ($isMaskable) {
        $g.FillRectangle($brush, $rect)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
        $radius = [int]($size * 0.22)
        $diameter = $radius * 2
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath

        $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
        $path.AddArc($size - $diameter, 0, $diameter, $diameter, 270, 90)
        $path.AddArc($size - $diameter, $size - $diameter, $diameter, $diameter, 0, 90)
        $path.AddArc(0, $size - $diameter, $diameter, $diameter, 90, 90)
        $path.CloseFigure()

        $g.FillPath($brush, $path)
    }

    # Draw letter 'M'
    $fontSize = [float]($size * 0.52)
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $fontStyle = [System.Drawing.FontStyle]::Bold
    $font = New-Object System.Drawing.Font $fontFamily, $fontSize, $fontStyle, ([System.Drawing.GraphicsUnit]::Pixel)
    $textBrush = [System.Drawing.Brushes]::White

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $x = [float]0
    $y = [float]($size * 0.02)
    $w = [float]$size
    $h = [float]$size
    $textRect = New-Object System.Drawing.RectangleF $x, $y, $w, $h
    $g.DrawString("M", $font, $textBrush, $textRect, $sf)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Successfully generated $outputPath ($size x $size)"
}

$destDir = "c:\MyMentor\public"
Generate-Icon -size 192 -outputPath "$destDir\pwa-192x192.png"
Generate-Icon -size 512 -outputPath "$destDir\pwa-512x512.png"
Generate-Icon -size 512 -outputPath "$destDir\maskable-icon-512x512.png" -isMaskable $true
Generate-Icon -size 180 -outputPath "$destDir\apple-touch-icon.png"
