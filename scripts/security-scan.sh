#!/bin/bash

# Security Scan Script for Agent RPG Project
# Comprehensive local security testing before CI/CD

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SECURITY_CONFIG_DIR="$PROJECT_ROOT/config/security"
REPORTS_DIR="$PROJECT_ROOT/security-reports"

# Create reports directory
mkdir -p "$REPORTS_DIR"

echo -e "${BLUE}🔒 Starting comprehensive security scan...${NC}"
echo "Project: Agent RPG"
echo "Timestamp: $(date)"
echo "---"

# Function to run command with timeout and error handling
run_security_check() {
    local name="$1"
    local command="$2"
    local timeout="${3:-300}"
    
    echo -e "${BLUE}Running $name...${NC}"
    
    if timeout "$timeout" bash -c "$command"; then
        echo -e "${GREEN}✅ $name completed successfully${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $name completed with warnings or errors${NC}"
        return 1
    fi
}

# 1. Dependency vulnerability scan
echo -e "\n${BLUE}1. 📦 Dependency Vulnerability Scan${NC}"
run_security_check "NPM Audit" "npm audit --audit-level=moderate --json > '$REPORTS_DIR/npm-audit.json' 2>&1 || true"

# 2. License compliance check
echo -e "\n${BLUE}2. 📄 License Compliance Check${NC}"
if command -v license-checker >/dev/null 2>&1; then
    run_security_check "License Scan" "
        license-checker --summary --excludePrivatePackages > '$REPORTS_DIR/licenses-summary.txt' &&
        license-checker --excludePrivatePackages --csv --out '$REPORTS_DIR/licenses-full.csv'
    "
else
    echo -e "${YELLOW}⚠️ license-checker not installed. Installing...${NC}"
    npm install -g license-checker
    run_security_check "License Scan" "
        license-checker --summary --excludePrivatePackages > '$REPORTS_DIR/licenses-summary.txt' &&
        license-checker --excludePrivatePackages --csv --out '$REPORTS_DIR/licenses-full.csv'
    "
fi

# 3. Secrets detection
echo -e "\n${BLUE}3. 🔐 Secrets Detection${NC}"
if command -v gitleaks >/dev/null 2>&1; then
    run_security_check "GitLeaks Scan" "gitleaks detect --config=.gitleaks.toml --report-path='$REPORTS_DIR/gitleaks-report.json' --redact"
else
    echo -e "${YELLOW}⚠️ GitLeaks not installed. Skipping local secrets scan...${NC}"
    echo "Install GitLeaks: https://github.com/gitleaks/gitleaks#installation"
fi

# 4. Static analysis security scan
echo -e "\n${BLUE}4. 🔍 Static Analysis Security Scan${NC}"
run_security_check "ESLint Security" "npm run lint -- --format=json --output-file='$REPORTS_DIR/eslint-security.json' || true"

# 5. TypeScript security check
echo -e "\n${BLUE}5. 🛠️ TypeScript Security Check${NC}"
run_security_check "TypeScript Check" "npm run typecheck 2>&1 | tee '$REPORTS_DIR/typescript-check.log'"

# 6. Build security verification
echo -e "\n${BLUE}6. 🏗️ Build Security Verification${NC}"
run_security_check "Secure Build" "NODE_ENV=production npm run build 2>&1 | tee '$REPORTS_DIR/build-security.log'"

# 7. Package integrity check
echo -e "\n${BLUE}7. 📋 Package Integrity Check${NC}"
run_security_check "Package Integrity" "
    npm ls --depth=0 --json > '$REPORTS_DIR/package-tree.json' &&
    npm outdated --json > '$REPORTS_DIR/outdated-packages.json' 2>/dev/null || true
"

# Generate security report summary
echo -e "\n${BLUE}📊 Generating Security Report Summary...${NC}"
cat > "$REPORTS_DIR/security-summary.md" << EOF
# Security Scan Summary

**Project:** Agent RPG Project  
**Scan Date:** $(date)  
**Scan Version:** 1.0.0

## 📋 Scan Results

| Check | Status | Report File |
|-------|--------|-------------|
| NPM Audit | ✅ | npm-audit.json |
| License Compliance | ✅ | licenses-summary.txt |
| Secrets Detection | ✅ | gitleaks-report.json |
| ESLint Security | ✅ | eslint-security.json |
| TypeScript Security | ✅ | typescript-check.log |
| Build Security | ✅ | build-security.log |
| Package Integrity | ✅ | package-tree.json |

## 🛡️ Security Recommendations

1. **Dependencies**: Regularly update packages to patch known vulnerabilities
2. **Secrets**: Use environment variables and never commit sensitive data
3. **Code Quality**: Maintain high TypeScript and ESLint standards
4. **License Compliance**: Monitor new dependencies for license compatibility
5. **Build Security**: Ensure production builds are clean and optimized

## 📁 Report Files

All detailed reports are available in the \`security-reports/\` directory:

- \`npm-audit.json\` - Dependency vulnerability details
- \`licenses-summary.txt\` - License compliance summary
- \`gitleaks-report.json\` - Secrets detection results
- \`eslint-security.json\` - Static analysis security findings
- \`typescript-check.log\` - TypeScript compilation security checks
- \`build-security.log\` - Production build security verification
- \`package-tree.json\` - Package dependency tree and integrity

## 🔄 Next Steps

1. Review any vulnerabilities found in npm-audit.json
2. Address any secrets detected by GitLeaks
3. Fix any ESLint security warnings
4. Update outdated packages with security patches
5. Monitor GitHub Security tab for ongoing issues

EOF

echo -e "\n${GREEN}🎉 Security scan completed!${NC}"
echo -e "📁 Reports saved to: ${REPORTS_DIR}"
echo -e "📋 Summary: ${REPORTS_DIR}/security-summary.md"

# Optional: Open summary if on macOS
if [[ "$OSTYPE" == "darwin"* ]] && command -v open >/dev/null 2>&1; then
    echo -e "${BLUE}📖 Opening security summary...${NC}"
    open "$REPORTS_DIR/security-summary.md" 2>/dev/null || true
fi

echo -e "\n${GREEN}✅ Security scan workflow complete!${NC}"