#!/bin/bash
# Automated PostgreSQL Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=${DB_NAME:-financeiro}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-postgres}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

echo "=========================================="
echo "🗄️  PostgreSQL Backup Script"
echo "=========================================="
echo "📅 Date: $(date)"
echo "📁 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "💾 Backup Directory: $BACKUP_DIR"
echo "⏰ Retention: $RETENTION_DAYS days"
echo "=========================================="

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${DATE}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "🚀 Starting backup..."

# Perform database dump
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"

# Compress backup
echo "📦 Compressing backup..."
gzip "$BACKUP_FILE"

echo "✅ Compressed: $COMPRESSED_FILE"

# Get file size
FILE_SIZE=$(ls -lh "$COMPRESSED_FILE" | awk '{print $5}')
echo "📊 Backup size: $FILE_SIZE"

# Delete old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "🗑️  Deleted $DELETED_COUNT old backup(s)"

# List current backups
echo ""
echo "📋 Current backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo "=========================================="
echo "✨ Backup completed successfully!"
echo "📁 File: $COMPRESSED_FILE"
echo "=========================================="
