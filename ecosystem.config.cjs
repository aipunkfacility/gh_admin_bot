
module.exports = {
    apps: [{
        name: "greenhill",
        script: "./dist/server/entry.mjs",
        instances: 1,
        exec_mode: "cluster",
        env: {
            NODE_ENV: "production",
            PORT: 4321,
            HOST: "127.0.0.1"
        },
        env_file: ".env"
        // Note: We will rely on loading .env via dotenv in the app start
        // OR we can specify env_file if PM2 version supports it.
        // Safest way for standard PM2:
    }]
}
