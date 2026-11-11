# Changelog

## 1.0.2

- Group → Get: send the group ID (…@g.us) as is. It was URL-encoded (@ became %40), which the WAservix API rejects.

## 1.0.1

- WAservix node: send text, image, document and location; message status, edit, delete, resend; number check and connection status; contacts; groups.
- WAservix Trigger: incoming messages, status updates and session events, with webhook secret check.
