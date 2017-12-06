module.exports = {
    prefix: 'q',
    redis: {
        port: 6379,
        host: '120.76.74.7',
        // auth: 'password',
        db: 3, // if provided select a non-default redis db
        options: {
            // see https://github.com/mranney/node_redis#rediscreateclient
        }
    }
}