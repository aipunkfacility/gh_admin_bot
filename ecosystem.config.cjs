
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
    }, {
        name: "greenhill-bot",
        script: "./scripts/poll.js",
        instances: 1,
        env: {
            NODE_ENV: "production"
        },
        env_file: ".env"
    }]
}
