# Release Scripts

This directory contains scripts to help with the release process for phantom-zod.

## 🚀 Quick Release

The easiest way to create a release:

```bash
npm run release
```

This interactive script will:
1. ✨ **Format code** with Prettier automatically
2. 🔍 **Run linter** to catch any issues  
3. 🧪 **Run all tests** to ensure quality
4. 📝 **Update version** in package.json
5. 📚 **Generate changelog** (optional, via GitHub workflow)
6. 🔄 **Create release PR** for review and approval
7. 🤖 **Auto-merge** when approved (triggers release)

## 📋 Release Options

### Interactive Release Script
```bash
npm run release
# OR
./scripts/prepare-release.sh
```
- Prompts for version type (patch/minor/major/custom)
- Runs all quality checks
- Handles changelog generation
- Safe confirmation before pushing

### Quick Version Bumps
```bash
npm run release:patch    # 1.5.0 → 1.5.1
npm run release:minor    # 1.5.0 → 1.6.0  
npm run release:major    # 1.5.0 → 2.0.0
```

## 🔄 Complete Release Workflow

The full automated release process works like this:

### 📝 Step 1: Create Release PR
1. **Release script** runs quality checks (format, lint, test)
2. **Creates release branch** (`release/v1.5.1`)
3. **Pushes branch** and creates PR to main
4. **PR includes** version bump and formatting changes

### ✅ Step 2: Review & Approval
1. **Review the PR** - Check version, changelog, changes
2. **Approve the PR** - At least 1 approval required
3. **CI checks pass** - All tests and linting must pass

### 🤖 Step 3: Auto-merge & Release
Once approved and CI passes, GitHub Actions will:

1. **🔀 Auto-merge PR** - Automatically merges to main
2. **🔍 Detect version change** - Triggers release workflow
3. **✨ Format code** - Runs Prettier to ensure consistency
4. **🔍 Run linter** - ESLint checks for code quality
5. **🧪 Run tests** - Full test suite across Node 18, 20, 22
6. **🏗️ Build package** - TypeScript compilation + asset copying
7. **📦 Publish to npm** - Automatic publishing with NPM_TOKEN
8. **🏷️ Create git tag** - Tags the release (e.g., v1.5.1)
9. **📋 Create GitHub release** - With notes from CHANGELOG.md

### 🎉 Step 4: Release Complete!
- **Package published** to npm registry
- **GitHub release** created with changelog
- **Git tag** created for the version
- **All done automatically!** 🚀

## 📚 Changelog Management

### Automatic Generation
```bash
# Trigger via GitHub Actions UI or:
gh workflow run auto-changelog.yml --field version="1.5.1"
```

This creates a PR with auto-generated changelog based on:
- ✨ **feat**: New features  
- 🐛 **fix**: Bug fixes
- 📚 **docs**: Documentation
- 🧪 **test**: Testing
- ♻️ **refactor**: Refactoring
- ⚡ **perf**: Performance
- 🔧 **chore**: Maintenance

### Manual Changelog
You can also manually update `CHANGELOG.md` and the release will use those notes.

## 🔧 Manual Process (if needed)

If you prefer the manual approach:

```bash
# 1. Format and test
npm run format
npm run lint  
npm test
npm run build

# 2. Update version
npm version patch  # or minor/major

# 3. Push (triggers automation)
git push origin main
```

## 📝 Requirements

- **Node.js 20+** (for scripts)
- **GitHub CLI** (for changelog generation)
- **NPM_TOKEN** secret configured in GitHub
- **Write access** to the repository

## 🎯 Best Practices

1. **Always use the release script** for consistency
2. **Review changelog PRs** before merging  
3. **Test locally** before releasing
4. **Follow semantic versioning**:
   - **patch**: Bug fixes, minor updates
   - **minor**: New features, backward compatible
   - **major**: Breaking changes
5. **Monitor the release** via GitHub Actions
6. **Verify publication** on npm and GitHub releases

The automation ensures every release is properly tested, formatted, and documented! 🚀
