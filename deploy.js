const { execSync } = require('child_process');
const path = require('path');
const config = require('./config.cjs');

const env = process.argv[2];
const callingDir = process.cwd();
const projectName = path.basename(callingDir);

if (!env || !['dev', 'prod'].includes(env)) {
  console.error("Usage: node deploy.js <dev|prod>");
  process.exit(1);
}

const envMap = {
  'dev': 'development',
  'prod': 'production'
};

const configKey = envMap[env];

if (!config[projectName] || !config[projectName][configKey]) {
    console.error(`Error: Configuration for project '${projectName}' and environment '${env}' not found.`);
    process.exit(1);
}

const deployConfig = config[projectName][configKey];

if (!deployConfig) {
  console.error(`Error: Configuration for environment '${env}' not found.`);
  process.exit(1);
}

const deploymentId = deployConfig.platform?.deploymentId;
if (!deploymentId) {
  console.error(`Error: Deployment ID not found for environment '${env}'.`);
  process.exit(1);
}

console.log(`Deploying to environment: ${env}`);
console.log(`Deployment ID: ${deploymentId}`);

try {
  // 1. Build
  console.log("Building...");
  if (env === 'dev') {
     execSync('npm run build:dev', { stdio: 'inherit' });
  } else {
     execSync('npm run build:prod', { stdio: 'inherit' });
  }

  // 2. Push code to Apps Script
  console.log("Pushing code to Apps Script...");
  execSync('npx clasp push -f', { stdio: 'inherit' });

  // 3. Deploy (release new version)
  console.log(`Deploying version...`);
  execSync(`npx clasp deploy -i ${deploymentId} -d "Deploying ${env}"`, { stdio: 'inherit' });

  console.log(`Deployment to ${env} successful!`);
} catch (error) {
  console.error("Deployment failed:", error.message);
  process.exit(1);
}
