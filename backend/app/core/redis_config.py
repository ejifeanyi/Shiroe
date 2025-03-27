import redis
from redis.exceptions import RedisError
from functools import wraps
import json
from typing import Any, Callable, Optional

# Initialize Redis client
import logging
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    redis_url = "redis://default:SjeFlGHPFuuAw4j5R2xwtEbPYb44eUuE@redis-19106.c246.us-east-1-4.ec2.redns.redis-cloud.com:19106"
    url = urlparse(redis_url)
    
    redis_client = redis.Redis(
        host=url.hostname,
        port=url.port,
        username=url.username or 'default',
        password=url.password,
        db=0,
        decode_responses=True
    )
    
    # Ping to verify connection
    redis_client.ping()
    logger.info("Redis connection established successfully")
except RedisError as e:
    logger.error(f"Redis connection error: {e}")
    redis_client = None

def cache_with_timeout(
    prefix: str, 
    timeout: int = 3600,  # Default 1 hour cache
    key_generator: Optional[Callable[[Any], str]] = None
):
    """
    Decorator for caching function results in Redis
    
    :param prefix: Prefix for the cache key
    :param timeout: Timeout in seconds for the cache
    :param key_generator: Optional function to generate custom cache keys
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Skip caching if Redis is not available
            if not redis_client:
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_generator:
                cache_key = key_generator(*args, **kwargs)
            else:
                # Default key generation using function name and args
                key_parts = [prefix, func.__name__]
                key_parts.extend(map(str, args))
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = ":".join(key_parts)
            
            # Try to get from cache
            try:
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
            except Exception as e:
                print(f"Redis cache retrieval error: {e}")
            
            # Call the original function
            result = func(*args, **kwargs)
            
            # Cache the result
            try:
                redis_client.setex(
                    cache_key, 
                    timeout, 
                    json.dumps(result, default=str)
                )
            except Exception as e:
                print(f"Redis cache storage error: {e}")
            
            return result
        return wrapper
    return decorator

def invalidate_cache(prefix: str, key: str):
    """
    Invalidate a specific cache entry
    
    :param prefix: Prefix for the cache key
    :param key: Specific key to invalidate
    """
    if not redis_client:
        return
    
    full_key = f"{prefix}:{key}"
    try:
        redis_client.delete(full_key)
    except RedisError as e:
        print(f"Redis cache invalidation error: {e}")

def clear_cache_by_pattern(pattern: str):
    """
    Clear multiple cache entries matching a pattern
    
    :param pattern: Redis pattern to match keys
    """
    if not redis_client:
        return
    
    try:
        # Find all matching keys
        matching_keys = redis_client.keys(pattern)
        
        # Delete all matching keys
        if matching_keys:
            redis_client.delete(*matching_keys)
    except RedisError as e:
        print(f"Redis cache pattern deletion error: {e}")