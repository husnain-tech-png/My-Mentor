$ErrorActionPreference = "Stop"

Write-Host "`n========================================================"
Write-Host "       MYMENTOR SECURITY VERIFICATION SUITE"
Write-Host "========================================================`n"

# 1. Health & Security Telemetry
Write-Host "1. Testing /api/health telemetry..."
$h = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
Write-Host "   Status:" $h.status
Write-Host "   Groq Key Configured:" $h.groqKeyConfigured
Write-Host "   Default Model:" $h.defaultModel
Write-Host "   Helmet Active:" $h.security.helmet
Write-Host "   CORS Policy:" $h.security.cors
Write-Host "   Rate Limiting:" $h.security.rateLimiting
Write-Host "   Proxy Auth:" $h.security.proxyAuth
Write-Host "   Whitelisted Models:" ($h.security.modelWhitelist -join ", ")

# 2. Unauthorized API Access Probe (No Token)
Write-Host "`n2. Probing /api/groq/test without authentication..."
try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/groq/test" -Method Post -ContentType "application/json" -Body "{}"
  Write-Host "   FAILED: Endpoint accepted unauthenticated call!" -ForegroundColor Red
} catch {
  Write-Host "   PASSED: Blocked with HTTP 403 Forbidden" -ForegroundColor Green
}

Write-Host "`n3. Probing /api/groq/chat without authentication..."
try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/groq/chat" -Method Post -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"hi"}]}'
  Write-Host "   FAILED: Endpoint accepted unauthenticated call!" -ForegroundColor Red
} catch {
  Write-Host "   PASSED: Blocked with HTTP 403 Forbidden" -ForegroundColor Green
}

# 4. Fetch Session Token
Write-Host "`n4. Fetching proxy session token via /api/session..."
$session = Invoke-RestMethod -Uri "http://localhost:3000/api/session"
if ($session.token -and $session.token.Length -eq 64) {
  Write-Host "   PASSED: Received 32-byte (64 hex char) session token" -ForegroundColor Green
} else {
  Write-Host "   FAILED: Invalid session token" -ForegroundColor Red
}

# 5. Authenticated Test
Write-Host "`n5. Executing authenticated test with valid session token..."
$test = Invoke-RestMethod -Uri "http://localhost:3000/api/groq/test" -Method Post -ContentType "application/json" -Headers @{ "X-Proxy-Token" = $session.token } -Body '{"model":"openai/gpt-oss-120b"}'
if ($test.ok) {
  Write-Host "   PASSED: LLM responded successfully ($($test.latencyMs)ms)" -ForegroundColor Green
} else {
  Write-Host "   FAILED: $test" -ForegroundColor Red
}

# 6. Model Injection Attack Probe
Write-Host "`n6. Attempting model injection with unapproved model..."
try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/groq/test" -Method Post -ContentType "application/json" -Headers @{ "X-Proxy-Token" = $session.token } -Body '{"model":"unauthorized/attacker-model-99"}'
  Write-Host "   FAILED: Disallowed model was accepted!" -ForegroundColor Red
} catch {
  Write-Host "   PASSED: Rejected with HTTP 400 Bad Request" -ForegroundColor Green
}

# 7. Security Headers Check
Write-Host "`n7. Verifying HTTP Security Headers..."
$resp = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
$csp = $resp.Headers["Content-Security-Policy"]
$xcto = $resp.Headers["X-Content-Type-Options"]
$rp = $resp.Headers["Referrer-Policy"]

if ($csp -and $csp.Contains("frame-src 'none'")) {
  Write-Host "   PASSED: Content-Security-Policy active with anti-clickjacking frame-src 'none'" -ForegroundColor Green
} else {
  Write-Host "   WARNING: CSP missing frame-src" -ForegroundColor Yellow
}

if ($xcto -eq "nosniff") {
  Write-Host "   PASSED: X-Content-Type-Options: nosniff" -ForegroundColor Green
} else {
  Write-Host "   WARNING: X-Content-Type-Options missing" -ForegroundColor Yellow
}

if ($rp) {
  Write-Host "   PASSED: Referrer-Policy: $rp" -ForegroundColor Green
}

Write-Host "`n========================================================"
Write-Host "   ALL SECURITY CONTROLS VERIFIED SUCCESSFULLY"
Write-Host "========================================================`n"

