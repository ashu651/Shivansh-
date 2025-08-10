# Architecture

## Post publish flow

1. Client requests signed upload from API `/api/v1/media/sign`.
2. Client uploads directly to Cloudinary using signature.
3. Client calls `/api/v1/media/verify` with `public_id` and metadata; API persists media metadata with post draft.
4. Client creates a post via `/api/v1/posts` with media array.
5. API enqueues background job to process video (FFmpeg) and generate thumbnails.
6. Worker processes job, updates post with processed assets.
7. API emits real-time notification via Socket.IO for followers.

## Message flow

- Socket namespace `/ws`.
- Client emits `auth` with JWT access token; server verifies and binds user to socket room.
- Client sends `dm:send` with `{ conversationId, text, attachments }`.
- Server persists message and emits `dm:receive` to conversation participants.
- `typing` and `read-receipt` events are broadcast to participants.

## Feed generation

- Time-ordered feed with cursor pagination by `createdAt`.
- Query selects posts from followed users and self with `createdAt < cursor`.
- `limit` parameter to cap page size; API returns `nextCursor` when more are available.