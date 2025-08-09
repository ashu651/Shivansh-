process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/snapzy';
process.env.REDIS_URL ||= 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET ||= 'dev_access_secret_change_me';
process.env.JWT_REFRESH_SECRET ||= 'dev_refresh_secret_change_me';