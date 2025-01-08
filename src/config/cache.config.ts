import EnvConfig from "./environment.config";

const CacheConfig = {
    stdTTL: EnvConfig.STD_TTL,
    checkperiod: EnvConfig.CHECK_PERIOD,
    maxKeys: EnvConfig.MAX_KEYS,
    deleteOnExpire: EnvConfig.DELETE_ON_EXPIRE
}

export default CacheConfig;