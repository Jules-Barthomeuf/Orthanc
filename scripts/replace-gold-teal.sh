#!/bin/bash
# Replace gold-400/300/500/600 color references with teal equivalents
# Special border cases handled first, then general replacements

FILES=(
  "app/page.tsx"
  "components/auth/AuthForm.tsx"
  "components/common/ToastContainer.tsx"
  "components/agent/AgentDashboard.tsx"
  "components/client/OverviewPanel.tsx"
  "components/client/ProvenancePanel.tsx"
  "components/client/TechnicalPanel.tsx"
  "components/client/MarketInsightPanel.tsx"
  "components/client/InvestmentAdvisorPanel.tsx"
  "components/client/InvestmentPanel.tsx"
  "components/client/LeaseAnalysisPanel.tsx"
  "components/client/Simulator.tsx"
  "components/client/SimulatorChat.tsx"
  "app/agent/my-properties/page.tsx"
  "app/agent/portals/page.tsx"
  "app/agent/portals/[id]/page.tsx"
  "app/agent/properties/[id]/page.tsx"
  "app/agent/profile/page.tsx"
  "app/client/properties/page.tsx"
  "app/client/vault/[id]/page.tsx"
)

cd /workspaces/Orthanc

TOTAL=0

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "SKIP (not found): $f"
    continue
  fi
  
  BEFORE=$(grep -c 'gold-[3456]' "$f" 2>/dev/null || echo 0)
  
  if [ "$BEFORE" -eq 0 ]; then
    echo "SKIP (no matches): $f"
    continue
  fi

  # Special border cases first (order matters!)
  # border-gold-400/10 -> border-dark-700/50 (but NOT /100, /15, etc)
  sed -i 's/border-gold-400\/10\b/border-dark-700\/50/g' "$f"
  # border-gold-400/20 -> border-dark-600/30
  sed -i 's/border-gold-400\/20\b/border-dark-600\/30/g' "$f"
  # border-gold-400/08 -> border-dark-600/20
  sed -i 's/border-gold-400\/08\b/border-dark-600\/20/g' "$f"

  # General replacements (gold -> teal)
  sed -i 's/gold-400/teal-400/g' "$f"
  sed -i 's/gold-300/teal-300/g' "$f"
  sed -i 's/gold-500/teal-500/g' "$f"
  sed -i 's/gold-600/teal-600/g' "$f"

  # font-display -> font-sans
  sed -i 's/font-display/font-sans/g' "$f"

  AFTER=$(grep -c 'gold-[3456]' "$f" 2>/dev/null || echo 0)
  REPLACED=$((BEFORE - AFTER))
  TOTAL=$((TOTAL + REPLACED))
  echo "UPDATED: $f (was $BEFORE lines, now $AFTER remaining, $REPLACED lines changed)"
done

echo ""
echo "=== TOTAL LINES CHANGED: $TOTAL ==="
echo ""
echo "=== Checking for any remaining gold- refs ==="
grep -rn 'gold-[3456]' --include='*.tsx' "${FILES[@]}" 2>/dev/null || echo "None found - all clean!"
