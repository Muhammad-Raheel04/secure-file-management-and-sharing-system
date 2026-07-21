import redisConnection from "../config/redis.js";

export const cache = (key, duration) => {
    return async (req, res, next) => {
        try {
            const cachedData = await redisConnection.get(key);

            if (cachedData) {
                console.log("Cache Hit")
                console.log("returing data from cache");
                return res.status(200).json(JSON.parse(cachedData));
            }

            console.log("Cache Miss");

            const originalJson = res.json.bind(res);

            res.json = (body) => {
                if (body !== undefined) {
                    redisConnection
                        .set(key, JSON.stringify(body), "EX", duration)
                        .catch((error) => {
                            console.error(`Redis cache set failed for ${key}:`, error);
                        });
                }

                return originalJson(body);
            };

            return next();
        } catch (error) {
            console.error(`Redis cache lookup failed for ${key}:`, error);
            return next(error);
        }
    };
};