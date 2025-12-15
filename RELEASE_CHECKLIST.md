# Release Checklist for v0.1.0

This document outlines the remaining manual steps needed to publish the first release of Ekilex MCP Server.

## ✅ Completed

- [x] Fix all ESLint deprecation warnings (updated to MCP SDK v1.23.0 APIs)
- [x] Add LICENSE file (MIT)
- [x] Add CHANGELOG.md
- [x] Add CONTRIBUTING.md
- [x] Add SECURITY.md
- [x] All tests passing (169 tests, 89%+ coverage)
- [x] Build successful
- [x] Linting passing
- [x] Type checking passing

## 📋 Manual Actions Required

### 1. Review and Update Documentation

**CHANGELOG.md:**
- [ ] Replace `YYYY-MM-DD` with actual release date (line 46)
- [ ] Review unreleased changes and ensure all features are documented

**SECURITY.md:**
- [ ] Add preferred contact method for security reports (line 19-24)
- [ ] Add security team contact information (line 173-178)

**CONTRIBUTING.md:**
- [ ] Add maintainer release process details if needed (line 264-269)

### 2. Configure GitHub Repository

**Secrets Required for Release Workflow:**
- [ ] Add `NPM_TOKEN` secret
  - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Create a new "Automation" token
  - Add to GitHub Secrets: Settings → Secrets and variables → Actions → New repository secret

- [ ] Add `DOCKERHUB_USERNAME` secret
  - Your Docker Hub username

- [ ] Add `DOCKERHUB_TOKEN` secret
  - Go to https://hub.docker.com/settings/security
  - Create a new access token
  - Add to GitHub Secrets

**Repository Settings:**
- [ ] Enable GitHub Actions if not already enabled
- [ ] Configure branch protection for `main` (recommended)

### 3. Pre-Release Testing

- [ ] Test npm package locally:
  ```bash
  npm pack
  npm install -g ./ekilex-mcp-0.1.0.tgz
  ekilex-mcp --help
  ```

- [ ] Test Docker build locally:
  ```bash
  docker build -t ekilex-mcp:test .
  docker run -e EKILEX_API_KEY=test ekilex-mcp:test
  ```

- [ ] Test with Claude Desktop (add to config):
  ```json
  {
    "mcpServers": {
      "ekilex": {
        "command": "npx",
        "args": ["-y", "./ekilex-mcp-0.1.0.tgz"],
        "env": {
          "EKILEX_API_KEY": "your-api-key"
        }
      }
    }
  }
  ```

### 4. Version Decision

Current version in package.json: `0.1.0`

- [ ] Decide if this should be `0.1.0` (beta) or `1.0.0` (stable)
- [ ] Update `package.json` version if needed
- [ ] Update references in documentation

### 5. Create Release

When ready to release:

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Update CHANGELOG.md with release date
# Edit CHANGELOG.md and replace YYYY-MM-DD with today's date

# 3. Commit any final changes
git add CHANGELOG.md
git commit -m "Prepare for v0.1.0 release"
git push origin main

# 4. Create and push tag
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# 5. GitHub Actions will automatically:
# - Run tests
# - Publish to npm
# - Build and push Docker image
# - Create GitHub release
```

### 6. Post-Release

- [ ] Verify npm package: https://www.npmjs.com/package/ekilex-mcp
- [ ] Verify Docker image: https://hub.docker.com/r/YOUR_USERNAME/ekilex-mcp
- [ ] Test installation: `npx ekilex-mcp`
- [ ] Announce release (optional):
  - Reddit: r/estonian, r/languagelearning
  - Discord: MCP community
  - LinkedIn/Twitter
  - Ekilex team (optional collaboration)

### 7. Optional Enhancements

**Nice to have before v1.0.0:**
- [ ] Add badges to README.md
  - npm version
  - Build status
  - Test coverage
  - License
- [ ] Add examples directory with real usage examples
- [ ] Create video demo or animated GIF
- [ ] Add to MCP servers registry
- [ ] Set up Dependabot for dependency updates
- [ ] Configure code coverage reporting (Codecov)

## Deployment Status Summary

**Current State:** Production-ready, pending manual deployment steps

**Estimated Time to First Release:** 1-2 hours (excluding testing time)

**Blockers:**
1. GitHub secrets configuration (NPM_TOKEN, DOCKERHUB credentials)
2. Version decision (0.1.0 vs 1.0.0)
3. Final testing and validation

**Non-Blockers (can do after release):**
- Security contact details
- Contributing guide details
- Badges and marketing materials

---

**Notes:**
- All code changes are complete and tested
- Documentation is comprehensive but has marked sections for manual updates
- CI/CD pipeline is fully configured and ready
- The project is in excellent shape for first release
