#!/bin/bash

# Prepare Release Script for phantom-zod
# This script helps prepare a new release by:
# 1. Updating the version in package.json
# 2. Optionally generating/updating CHANGELOG.md
# 3. Creating a commit and pushing to trigger the automated release

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root directory?"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for new version
echo ""
echo "What type of release is this?"
echo "1) patch (bug fixes)           - $CURRENT_VERSION → $(npm version patch --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "2) minor (new features)        - $CURRENT_VERSION → $(npm version minor --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "3) major (breaking changes)    - $CURRENT_VERSION → $(npm version major --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"
echo "4) custom version"
echo ""
read -p "Select option (1-4): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        NEW_VERSION=$(npm version patch --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        VERSION_TYPE="patch"
        ;;
    2)
        NEW_VERSION=$(npm version minor --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        VERSION_TYPE="minor"
        ;;
    3)
        NEW_VERSION=$(npm version major --dry-run 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " NEW_VERSION
        VERSION_TYPE="custom"
        ;;
    *)
        print_error "Invalid selection"
        exit 1
        ;;
esac

print_status "New version will be: $NEW_VERSION"

# Confirm the version
echo ""
read -p "Continue with version $NEW_VERSION? (y/N): " CONFIRM
if [[ $CONFIRM != [yY] ]]; then
    print_warning "Release cancelled"
    exit 0
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash your changes first."
    git status --short
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch (currently on: $CURRENT_BRANCH)"
    read -p "Do you want to switch to main? (y/N): " SWITCH_BRANCH
    if [[ $SWITCH_BRANCH == [yY] ]]; then
        git checkout main
        git pull origin main
    else
        print_warning "Continuing on branch: $CURRENT_BRANCH"
    fi
fi

# Format code with prettier
print_status "Formatting code with Prettier..."
npm run format

# Run linter
print_status "Running linter..."
if npm run lint; then
    print_success "Linting passed!"
else
    print_error "Linting failed. Please fix the issues before releasing."
    exit 1
fi

# Run tests before release
print_status "Running tests..."
if npm test; then
    print_success "All tests passed!"
else
    print_error "Tests failed. Please fix the issues before releasing."
    exit 1
fi

# Update version in package.json
print_status "Updating version in package.json..."
npm version $NEW_VERSION --no-git-tag-version

# Check if CHANGELOG.md should be updated
echo ""
read -p "Do you want to update CHANGELOG.md? (Y/n): " UPDATE_CHANGELOG
if [[ $UPDATE_CHANGELOG != [nN] ]]; then
    if command -v gh &> /dev/null; then
        print_status "Triggering automatic changelog generation..."
        gh workflow run auto-changelog.yml --field version="$NEW_VERSION"
        print_success "Changelog generation workflow triggered!"
        print_warning "Please review and merge the changelog PR before proceeding with the release."
        print_warning "After merging the changelog PR, run this script again or manually commit the version change."
        exit 0
    else
        print_warning "GitHub CLI not found. Please update CHANGELOG.md manually or install gh CLI for automatic generation."
        read -p "Press Enter to continue without updating CHANGELOG.md..."
    fi
fi

# Create release branch
RELEASE_BRANCH="release/v$NEW_VERSION"
print_status "Creating release branch: $RELEASE_BRANCH"
git checkout -b "$RELEASE_BRANCH"

# Create release commit
print_status "Creating release commit..."
git add package.json
if [ -f "CHANGELOG.md" ]; then
    git add CHANGELOG.md
fi

# Add any formatting changes
if [ -n "$(git status --porcelain)" ]; then
    git add .
fi

COMMIT_MESSAGE="chore(release): bump version to v$NEW_VERSION"
git commit -m "$COMMIT_MESSAGE"

# Ask before creating PR
echo ""
print_status "Ready to create release PR. This will:"
echo "  1. Push release branch to origin"
echo "  2. Create PR for review and approval"
echo "  3. Once approved and merged, automatic release will trigger"
echo ""
read -p "Create release PR? (y/N): " CREATE_PR

if [[ $CREATE_PR == [yY] ]]; then
    print_status "Pushing release branch..."
    git push origin "$RELEASE_BRANCH"
    
    print_status "Creating pull request..."
    if command -v gh &> /dev/null; then
        gh pr create \
            --title "🚀 Release v$NEW_VERSION" \
            --body "## 🚀 Release v$NEW_VERSION

This PR contains the version bump for releasing v$NEW_VERSION.

### 📋 Changes
- Updated version in package.json: $(git show HEAD~1:package.json | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version") → $NEW_VERSION
- Code formatting applied via Prettier
- All tests passing ✅
- All linting checks passed ✅

### 🤖 What happens after merge:
1. **Automatic release workflow** will trigger
2. **Build and test** the package
3. **Publish to npm** automatically
4. **Create GitHub release** with changelog
5. **Tag the release** (v$NEW_VERSION)

### ✅ Pre-merge checklist:
- [ ] Version bump is correct
- [ ] CHANGELOG.md is updated (if applicable)
- [ ] All CI checks pass
- [ ] Ready for release

**Once approved and merged, the release will be automatic!** 🚀" \
            --base main \
            --head "$RELEASE_BRANCH"
        
        PR_URL=$(gh pr view --json url -q .url 2>/dev/null || echo "")
        
        print_success "Release PR created successfully!"
        if [ -n "$PR_URL" ]; then
            print_status "PR URL: $PR_URL"
        fi
        print_status "Next steps:"
        print_status "  1. Review the PR for accuracy"
        print_status "  2. Approve and merge the PR"
        print_status "  3. GitHub Actions will automatically:"
        print_status "     • Build and test the package"
        print_status "     • Publish to npm"
        print_status "     • Create GitHub release and tag"
        
    else
        print_error "GitHub CLI not found. Please install 'gh' CLI to create the PR automatically."
        print_warning "Manual PR creation needed:"
        print_warning "  1. Go to GitHub and create a PR from $RELEASE_BRANCH to main"
        print_warning "  2. Use title: 🚀 Release v$NEW_VERSION"
    fi
else
    print_warning "Release branch created but PR not created."
    print_warning "To create the PR manually:"
    print_warning "  1. Push branch: git push origin $RELEASE_BRANCH"
    print_warning "  2. Create PR from $RELEASE_BRANCH to main"
    print_warning "Or run: gh pr create --title '🚀 Release v$NEW_VERSION' --base main --head $RELEASE_BRANCH"
fi

print_success "Release preparation complete!"
