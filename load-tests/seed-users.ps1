# Yük testi için 10 test kullanıcısı oluşturur (userId 1..10)
$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:3000" }

Write-Host "Test kullanicilari olusturuluyor: $baseUrl"

for ($i = 1; $i -le 10; $i++) {
  $email = "loaduser$i@test.com"
  $body = @{ email = $email; password = "test123456" } | ConvertTo-Json

  try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body
    Write-Host "OK id=$($res.user.id) email=$email"
  } catch {
    $err = $_.ErrorDetails.Message
    if ($err -match "kullanımda|already") {
      Write-Host "SKIP (zaten var): $email"
    } else {
      Write-Host "HATA $email : $err"
    }
  }
}

Write-Host "Bitti. k6 icin: `$env:MAX_USER_ID='10'"
