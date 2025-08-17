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

# Create release commit
print_status "Creating release commit..."
git add package.json
if [ -f "CHANGELOG.md" ]; then
    git add CHANGELOG.md
fi

COMMIT_MESSAGE="chore(release): bump version to v$NEW_VERSION"
git commit -m "$COMMIT_MESSAGE"

# Ask before pushing
echo ""
print_status "Ready to push release commit. This will trigger the automated release process:"
echo "  1. Build and test the package"
echo "  2. Publish to npm"
echo "  3. Create GitHub release and tag"
echo ""
read -p "Push to origin and trigger release? (y/N): " PUSH_RELEASE

if [[ $PUSH_RELEASE == [yY] ]]; then
    print_status "Pushing to origin..."
    git push origin $CURRENT_BRANCH
    
    print_success "Release process initiated!"
    print_status "You can monitor the progress at: https://github.com/cartyd/phantom-zod/actions"
    print_status "The release should be available shortly at:"
    print_status "  - npm: https://www.npmjs.com/package/phantom-zod"
    print_status "  - GitHub: https://github.com/cartyd/phantom-zod/releases"
else
    print_warning "Release commit created but not pushed."
    print_warning "To complete the release, run: git push origin $CURRENT_BRANCH"
fi

print_success "Release preparation complete!"
