# Beta deployment

1. Copy `.env.example` to `.env.local`.
2. Set a long random `OLFACTUS_SESSION_SECRET`.
3. Set `OLFACTUS_DATA_DIR` to persistent attached storage for the included
   single-server adapter.
4. Run tests and the production build.
5. Verify `GET /api/health`.

The JSON persistence adapter is appropriate for local evaluation and a
single-instance private beta. It is not intended for horizontally scaled
production deployment. Use `database/schema.sql` to implement the PostgreSQL
adapter before multi-instance deployment.
