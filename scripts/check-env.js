#!/usr/bin/env node

// Script to check environment variables
console.log('🔧 Environment Variables Check:');
console.log('================================');

const requiredVars = [
  'VITE_QUIZ_BASE_URL',
  'VITE_AUTH_URL',
];

const optionalVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_NAME',
  'VITE_NODE_ENV',
  'VITE_ENABLE_QLDT_AUTH',
];

console.log('\n📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`${status} ${varName}: ${value || 'NOT SET'}`);
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${varName}: ${value || 'NOT SET'}`);
});

console.log('\n🔧 All Environment Variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('VITE_'))
  .sort()
  .forEach(key => {
    console.log(`   ${key}=${process.env[key]}`);
  });

// Check if all required vars are set
const missingRequired = requiredVars.filter(varName => !process.env[varName]);
if (missingRequired.length > 0) {
  console.log('\n❌ Missing required environment variables:');
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Please set these variables in your .env file or Vercel dashboard');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}
