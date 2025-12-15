# Security Policy

## Supported Versions

<!--
MANUAL ACTION REQUIRED:
Update this table as new versions are released and older versions reach end-of-life.
-->

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report Privately

<!--
MANUAL ACTION REQUIRED:
Add your preferred contact method for security reports. Options:
- GitHub Security Advisories: https://github.com/TisteAI/ekilex_mcp/security/advisories/new
- Email: security@yourdomain.com
- Other private communication channel
-->

**Report security vulnerabilities via:**
- GitHub Security Advisories: [Create a security advisory](https://github.com/TisteAI/ekilex_mcp/security/advisories/new)
- Or open a private issue and request security team contact

### 3. Include Details

When reporting, please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 4. Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity

## Security Best Practices

### API Key Management

**Never commit API keys to version control**

✅ **Good practices:**
```bash
# Use environment variables
export EKILEX_API_KEY=your-api-key

# Or use .env file (add to .gitignore)
echo "EKILEX_API_KEY=your-api-key" > .env
```

❌ **Bad practices:**
```json
// DON'T hardcode in config files
{
  "ekilex": {
    "env": {
      "EKILEX_API_KEY": "actual-key-here"  // WRONG!
    }
  }
}
```

### Docker Security

When running in Docker:

✅ **Use secrets:**
```bash
# Use Docker secrets
docker run -e EKILEX_API_KEY=$(cat /run/secrets/ekilex-key) ekilex-mcp

# Or environment file
docker run --env-file .env ekilex-mcp
```

✅ **Run as non-root:**
- Container already runs as non-root user `ekilex` (UID 1001)

### Production Deployment

**Recommended security measures:**

1. **Network isolation**
   - Run MCP server in private network
   - Use firewall rules
   - Limit HTTP transport exposure

2. **Access control**
   - Restrict who can access the HTTP endpoint
   - Use reverse proxy with authentication if needed
   - Consider VPN for remote access

3. **Monitoring**
   - Monitor for unusual API usage patterns
   - Set up alerts for errors
   - Review logs regularly

4. **Updates**
   - Keep dependencies updated
   - Subscribe to security advisories
   - Apply security patches promptly

### Known Security Considerations

1. **API Key Exposure**
   - API keys are passed to the MCP server via environment variables
   - Never log or expose API keys in responses
   - Rotate keys if compromised

2. **HTTP Transport**
   - HTTP endpoint is intended for local use
   - For remote access, use HTTPS reverse proxy
   - Consider authentication for production use

3. **Input Validation**
   - All tool inputs are validated with Zod schemas
   - Wildcard characters are handled safely
   - No SQL injection risk (API-only, no database)

4. **Dependencies**
   - Regular dependency updates via Dependabot
   - Automated security scanning in CI/CD
   - Minimal dependency footprint

## Vulnerability Disclosure Process

1. **Report received** - Acknowledged within 48 hours
2. **Validation** - Confirm and assess severity
3. **Fix development** - Create patch (private)
4. **Testing** - Verify fix doesn't break functionality
5. **Release** - Publish security update
6. **Disclosure** - Public advisory after fix is released
7. **Credit** - Reporter credited (if desired)

## Security Updates

Security updates will be:
- Released as patch versions (e.g., 0.1.1)
- Documented in CHANGELOG.md
- Announced in GitHub Security Advisories
- Tagged with `security` label

## Scope

### In Scope

- Ekilex MCP Server code
- Docker container configuration
- Dependencies with known vulnerabilities
- API key exposure risks

### Out of Scope

- Ekilex API itself (report to Ekilex team)
- Third-party MCP clients
- User's local environment configuration
- Social engineering attacks

## Security Contact

<!--
MANUAL ACTION REQUIRED:
Add contact information for security team or maintainers.
-->

For security-related questions (not vulnerabilities), you can:
- Open a public issue with `[SECURITY QUESTION]` prefix
- Contact maintainers via GitHub

---

**Last updated:** 2024-12-15
