#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${YELLOW}🔍 Current branch: ${GREEN}$CURRENT_BRANCH${NC}"

# Check if we're on main
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${RED}⚠️  WARNING: You are on the main branch!${NC}"
    echo -e "${YELLOW}📝 Recommended action:${NC}"
    echo -e "   ${GREEN}git checkout -b feature/your-description${NC}"
    echo -e "   ${GREEN}# Make your changes${NC}"
    echo -e "   ${GREEN}git push origin feature/your-description${NC}"
    echo -e "   ${GREEN}# Create PR${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Safe to make changes on feature branch!${NC}"
    exit 0
fi
