param([string]$In, [string]$Out, [int]$X, [int]$Y, [int]$W, [int]$H)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($In)
$W = [Math]::Min($W, $img.Width - $X)
$H = [Math]::Min($H, $img.Height - $Y)
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$W,$H)), (New-Object System.Drawing.Rectangle($X,$Y,$W,$H)), [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
Write-Output "$Out ($W x $H)"
