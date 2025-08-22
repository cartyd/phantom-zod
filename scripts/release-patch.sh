#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting patch release process...${NC}"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Must be on main branch to create release. Current branch: $CURRENT_BRANCH${NC}"
    exit 1
fi

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Error: Working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Ensure we're up to date with origin
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Run validation before version bump
echo -e "${YELLOW}🧪 Running validation...${NC}"
npm run validate

# Bump version
echo -e "${YELLOW}📦 Bumping patch version...${NC}"
npm version patch --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
BRANCH_NAME="release/v${NEW_VERSION}"

echo -e "${GREEN}✅ Version bumped to ${NEW_VERSION}${NC}"

# Create release branch
echo -e "${YELLOW}🌿 Creating release branch: ${BRANCH_NAME}${NC}"
git checkout -b "$BRANCH_NAME"

# Add and commit changes
git add package.json package-lock.json
git commit -m "chore(release): bump version to ${NEW_VERSION}"

# Push branch
echo -e "${YELLOW}📤 Pushing release branch...${NC}"
git push -u origin "$BRANCH_NAME"

# Create PR
echo -e "${YELLOW}📋 Creating pull request...${NC}"
gh pr create \
    --title "chore(release): Release v${NEW_VERSION}" \
    --body "## 🚀 Release v${NEW_VERSION}

This is an automated patch release.

### 📦 Version Changes
- **Previous**: $(git show HEAD~1:package.json | node -p \"JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version\")
- **New**: ${NEW_VERSION}

### ✅ Pre-release Validation
- All tests passing
- Code formatted and linted
- Build successful

This PR will trigger the release workflow once merged." \
    --assignee "@me"

echo -e "${GREEN}✅ Release PR created successfully!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Review and merge the PR"
echo -e "  2. The release workflow will automatically publish to npm and create GitHub release"
echo -e "  3. Switch back to main: ${YELLOW}git checkout main${NC}"
