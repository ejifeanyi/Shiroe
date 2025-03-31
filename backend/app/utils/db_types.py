from sqlalchemy import TypeDecorator, Date
from datetime import datetime, date

class CustomDate(TypeDecorator):
    """Custom Date type for SQLAlchemy that ensures proper date conversion"""

    impl = Date

    def process_bind_param(self, value, dialect):
        """Process the value before binding to database"""
        if value is None:
            return None

        if isinstance(value, date):
            # If it's already a date but not a datetime, return as is
            if not isinstance(value, datetime):
                return value
            # If it's a datetime, convert to date
            return value.date()

        if isinstance(value, str):
            # Handle ISO format strings
            try:
                if "T" in value:
                    # It's a datetime string
                    if value.endswith("Z"):
                        value = value[:-1] + "+00:00"  # Convert Z to proper UTC format
                    dt = datetime.fromisoformat(value)
                    return dt.date()
                else:
                    # It's a date string
                    return date.fromisoformat(value)
            except (ValueError, TypeError) as e:
                # Log the error if needed
                print(f"Error converting string to date: {e}")
                return None

        # For any other types or failures, return None
        return None
