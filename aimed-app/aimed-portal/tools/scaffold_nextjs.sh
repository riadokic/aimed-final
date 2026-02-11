#!/bin/bash
# Scaffold the AIMED Next.js project structure.
#
# Usage:
#   bash tools/scaffold_nextjs.sh [target_directory]
#
# Default target: ./aimed-app

set -e

TARGET="${1:-aimed-app}"

echo "Scaffolding AIMED Next.js project in: $TARGET"

# Create directory structure
mkdir -p "$TARGET/public"
mkdir -p "$TARGET/src/app/novi-nalaz"
mkdir -p "$TARGET/src/components/ui"
mkdir -p "$TARGET/src/components/layout"
mkdir -p "$TARGET/src/components/recording"
mkdir -p "$TARGET/src/components/report"
mkdir -p "$TARGET/src/hooks"
mkdir -p "$TARGET/src/services"
mkdir -p "$TARGET/src/lib"
mkdir -p "$TARGET/src/types"

# Create placeholder files
touch "$TARGET/src/app/layout.tsx"
touch "$TARGET/src/app/page.tsx"
touch "$TARGET/src/app/globals.css"
touch "$TARGET/src/app/novi-nalaz/page.tsx"

touch "$TARGET/src/components/ui/button.tsx"
touch "$TARGET/src/components/ui/card.tsx"
touch "$TARGET/src/components/ui/loading-spinner.tsx"
touch "$TARGET/src/components/ui/toast.tsx"

touch "$TARGET/src/components/layout/sidebar.tsx"
touch "$TARGET/src/components/layout/header.tsx"
touch "$TARGET/src/components/layout/page-container.tsx"

touch "$TARGET/src/components/recording/record-button.tsx"
touch "$TARGET/src/components/recording/recording-timer.tsx"
touch "$TARGET/src/components/recording/audio-visualizer.tsx"

touch "$TARGET/src/components/report/report-viewer.tsx"
touch "$TARGET/src/components/report/report-editor.tsx"
touch "$TARGET/src/components/report/report-section.tsx"
touch "$TARGET/src/components/report/report-actions.tsx"

touch "$TARGET/src/hooks/use-audio-recorder.ts"
touch "$TARGET/src/hooks/use-aimed-api.ts"

touch "$TARGET/src/services/aimed-api.ts"

touch "$TARGET/src/lib/report-parser.ts"
touch "$TARGET/src/lib/pdf-generator.ts"
touch "$TARGET/src/lib/utils.ts"

touch "$TARGET/src/types/aimed.ts"

# Create .env.local template
cat > "$TARGET/.env.local.example" << 'EOF'
NEXT_PUBLIC_AIMED_WEBHOOK_URL=https://your-n8n-instance.com/webhook/AIMED
EOF

echo ""
echo "Done. Structure created at: $TARGET/"
echo ""
echo "Next steps:"
echo "  1. cd $TARGET"
echo "  2. npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir"
echo "  3. cp .env.local.example .env.local"
echo "  4. Edit .env.local with your n8n webhook URL"
echo ""
find "$TARGET" -type f | sort
