from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create a more sophisticated limiter that can handle both 
# authenticated and non-authenticated users
def get_user_identifier(request: Request):
    try:
        # Attempt to get the current user
        user = request.state.current_user
        return f"user:{user.id}"
    except AttributeError:
        # Fallback to IP address for non-authenticated users
        return get_remote_address(request)

# Create limiter instances
ip_limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/day"]  # Global IP-based limit
)

user_limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["200/hour"]  # More generous limit for authenticated users
)