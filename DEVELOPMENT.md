# 🛠️ Development Guide

## 📋 Development Workflow

### ✅ Before Making Changes

1. **Ensure clean state**:
   ```bash
   git status  # Should be clean
   git pull origin main  # Get latest changes
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 🔧 During Development

1. **Run validation frequently**:
   ```bash
   npm run validate  # Formats, lints, tests, and builds
   ```

2. **Individual commands**:
   ```bash
   npm run format    # Format code with Prettier
   npm run lint      # Check for linting errors
   npm run test      # Run test suite
   npm run build     # Build TypeScript
   ```

### 📤 Before Committing

The pre-commit hook will automatically:
- ✅ Format your code (`npm run format`)
- ✅ Run lint-staged for changed files
- ✅ Run full validation (`npm run validate`)

If any step fails, the commit will be blocked.

### 📋 Creating Pull Requests

1. **Push your branch**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

2. **Create PR** using the template which includes:
   - ✅ Pre-submission checklist
   - 📝 Description of changes
   - 🧪 Testing information
   - 📖 Documentation updates

3. **Required before PR submission**:
   - [ ] Code formatted with `npm run format`
   - [ ] All tests passing with `npm run test`
   - [ ] No linting errors with `npm run lint`
   - [ ] Successful build with `npm run build`
   - [ ] Full validation with `npm run validate`

## 🚀 Release Process

### 🔄 Automated Release Workflow

**Never push directly to main!** Use the release scripts:

```bash
# For patch releases (bug fixes)
npm run release:patch

# For minor releases (new features)
npm run release:minor

# For major releases (breaking changes)
npm run release:major
```

### 📦 What the Release Scripts Do

1. ✅ **Validation**: Checks you're on main, working directory is clean
2. 🧪 **Testing**: Runs `npm run validate` (format, lint, test, build)
3. 📦 **Version Bump**: Updates package.json and package-lock.json
4. 🌿 **Branch Creation**: Creates release branch (e.g., `release/v1.6.1`)
5. 📤 **Push & PR**: Pushes branch and creates pull request
6. 🔄 **GitHub Actions**: PR merge triggers automated npm publish and GitHub release

### 🏷️ After Release PR Merge

GitHub Actions will automatically:
- 📦 Publish to npm
- 🏷️ Create git tag
- 📰 Create GitHub release with notes

## 🚫 What NOT to Do

### ❌ Direct Main Branch Operations
```bash
# DON'T DO THIS:
git push origin main  # Main is protected
npm version minor && git push  # Will fail due to protection
```

### ❌ Skipping Validation
```bash
# DON'T DO THIS:
git commit -m "quick fix" --no-verify  # Skips hooks
git push origin feature/xyz  # Without running tests
```

### ❌ Manual Tag Creation
```bash
# DON'T DO THIS:
git tag v1.6.1  # Let GitHub Actions handle this
npm publish  # Let GitHub Actions handle this
```

## 🔧 Branch Protection Rules

Main branch is protected with:
- ✅ **Required PR reviews**
- ✅ **Required status checks**
- ✅ **No direct pushes**
- ✅ **No force pushes**

## 🧪 Quality Gates

### Pre-commit Hooks
- 🎨 **Formatting**: Automatic code formatting
- 🔍 **Linting**: ESLint validation
- 🧪 **Testing**: Full test suite
- 🏗️ **Building**: TypeScript compilation

### GitHub Actions CI
- 🔄 **Multi-node testing**: Node 18, 20, 22
- 📊 **Coverage reporting**: Codecov integration
- 🔍 **Format checking**: Prettier validation
- 🏗️ **Build validation**: TypeScript compilation

### Release Workflow
- 📦 **Version detection**: Automatic version change detection
- 🧪 **Full validation**: Format, lint, test, build
- 📦 **NPM publishing**: Automated package publishing
- 🏷️ **Git tagging**: Automatic tag creation
- 📰 **Release notes**: GitHub release creation

## 🆘 Troubleshooting

### Pre-commit Hook Failures
```bash
# Fix formatting issues
npm run format

# Fix linting issues
npm run lint:fix

# Run tests to see failures
npm run test

# Full validation
npm run validate
```

### Release Script Failures
```bash
# Ensure clean working directory
git status
git stash  # If you have uncommitted changes

# Ensure you're on main
git checkout main
git pull origin main

# Try again
npm run release:minor
```

### GitHub Actions Failures
- Check the Actions tab for detailed logs
- Common issues: failing tests, linting errors, build failures
- Fix issues locally and push to your feature branch

## 📚 Additional Resources

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [API Documentation](README.md)
- [GitHub Actions Workflows](.github/workflows/)

---

**Remember**: Quality is enforced at every step to ensure a stable, reliable codebase! 🎯
