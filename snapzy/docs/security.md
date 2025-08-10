# Security & Threat Model

## Controls implemented

- Argon2id password hashing with safe parameters
- JWT access tokens (short-lived) and rotating refresh tokens stored in Redis
- CSRF mitigation: cookie flags + double submit on sensitive flows
- Strict CORS and CSP headers
- Per-route and per-IP rate limiting
- Audit logging via structured JSON logs
- Data export and deletion endpoints for GDPR

## Threats

- Credential stuffing: rate limits, 2FA hooks, password hashing
- XSS/CSRF: CSP, escaping, `SameSite` cookies, anti-CSRF tokens
- SSRF: only signed uploads; validate outbound callbacks
- IDOR: use authorization guards and scoped queries
- DoS: global and route-specific throttling and circuit breakers

## Secrets handling

- Use environment variables or secret stores in production
- Do not commit secrets; rotate on suspicion of leakage