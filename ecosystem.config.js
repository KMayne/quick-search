module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [{
      name      : 'Quick Search',
      script    : 'bin/www',
      env_production: {
        NODE_ENV: 'production'
      },
      watch: false,
      max_memory_restart: '100M',
      exec_mode: 'cluster',
      instances: -1,
      min_uptime: '5s',
      max_restarts: 5
  }]
};
