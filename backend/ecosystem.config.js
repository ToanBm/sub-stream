module.exports = {
    apps: [
        {
            name: 'substream-backend',
            script: 'npm',
            args: 'start',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3005
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }
    ]
};
