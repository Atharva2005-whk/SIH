// TypeScript Configuration Fix Script
// Run this if you're having TypeScript issues in VS Code

console.log('🔧 Fixing TypeScript configuration...');

const fs = require('fs');
const path = require('path');

// Clean up any problematic files
try {
  // Remove tsbuildinfo if exists
  if (fs.existsSync('tsconfig.tsbuildinfo')) {
    fs.unlinkSync('tsconfig.tsbuildinfo');
    console.log('✅ Removed tsconfig.tsbuildinfo');
  }

  // Check if node_modules/.cache exists and clean it
  const cachePath = path.join('node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('✅ Cleaned node_modules/.cache');
  }

  console.log('✅ TypeScript configuration cleaned!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. In VS Code, press Ctrl+Shift+P');
  console.log('2. Type "TypeScript: Restart TS Server"');
  console.log('3. Press Enter');
  console.log('');
  console.log('This should fix any TypeScript errors in VS Code.');

} catch (error) {
  console.error('❌ Error fixing TypeScript:', error.message);
}
