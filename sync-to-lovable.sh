#!/bin/bash

# Sync script for Lovable project
# This script helps you sync local changes to GitHub/Lovable

echo "🔄 Syncing to Lovable..."

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Changes detected, committing..."
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    git commit -m "sync: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo "✅ Successfully synced to Lovable!"
    echo "🌐 Your changes will appear in Lovable shortly."
else
    echo "ℹ️  No changes to sync."
fi

echo "📊 Current status:"
git status --short
