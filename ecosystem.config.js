module.exports = {

  apps: [
    {
      name: 'dr-admin',
      script: 'node_modules/.bin/next',
      args: 'start',
      // NO cwd — PM2 uses the directory of ecosystem.config.js on each server
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',

      env: {                        // dev (no --env flag)
        NODE_ENV: 'production',
        PORT: 3002
      },

      env_staging: {                // staging (--env staging)
        NODE_ENV: 'production',
        PORT: 3000
      },

      env_production: {             // production (--env production)
        NODE_ENV: 'production',
        PORT: 3000
      },

      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    development: {
      user: 'root',
      ref: 'origin/development',
      repo: 'git@github.com:OnPoint-Software-Services/dr-admin.git',
      path: '/root/projects/doctor-app-admin-frontend',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js'
    },

    staging: {
      user: 'ubuntu',
      ref: 'origin/staging',
      repo: 'git@github.com:OnPoint-Software-Services/dr-admin.git',
      path: '/home/ubuntu/projects/staging-dr-app/frontend',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    },

     production: {
      user: 'ubuntu',
      ref: 'origin/main',
      repo: 'git@github.com:OnPoint-Software-Services/dr-admin.git',
      path: '/home/ubuntu/projects/live-dr-app/frontend',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }

}