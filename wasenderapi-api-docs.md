# WasenderApi

> WasenderApi provides a WhatsApp API for sending messages, managing sessions, working with groups and contacts, and receiving webhook events.

This file is generated dynamically from the published API documentation.

## Developer SDKs
Platform-specific SDKs to help you seamlessly connect with our API using minimal boilerplate.

- [Official SDKs – Node.js, Python & Laravel](https://wasenderapi.com/api-docs/developer-sdks/official-sdks-nodejs-python-laravel): WasenderAPI provides official SDKs to help developers integrate quickly and efficiently using their preferred programming language or framework.

## Getting Started
Kick off your integration with WasenderAPI in minutes. This section guides you through the essentials — from generating your API token to establishing your first WhatsApp session and sending your first message.

- [Getting Started with WasenderAPI](https://wasenderapi.com/api-docs/getting-started/getting-started-with-wasenderapi): Learn how to quickly set up your WasenderAPI account and start sending WhatsApp messages in minutes. This guide covers account creation, token generation, sending your first message, and tracking delivery using our developer-friendly REST API.
- [Using Our API with Postman](https://wasenderapi.com/api-docs/getting-started/using-our-api-with-postman): Learn how to interact with our API using the official Postman collection.
- [How To Receive Messages and Media From Wasenderapi](https://wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi): A developer's guide to receiving and processing real-time message events. This documentation details the flattened JSON payload, unified messageBody field, and handling for both Private and Group chats.
- [Model Context Protocol (MCP) Integration](https://wasenderapi.com/api-docs/getting-started/model-context-protocol-mcp-integration): Connect WasenderAPI to AI agents and automation tools using the Model Context Protocol. This remote MCP server exposes WhatsApp session management, messaging, contacts, and groups as callable tools for Claude Code, OpenCode, n8n, and other MCP-compatible platforms. Requires a paid plan and Personal Access Token for authentication.
- [Using Proxies](https://wasenderapi.com/api-docs/getting-started/using-proxies): Learn how to configure proxies for your WhatsApp sessions to prevent frequent disconnects and ensure fast, reliable message delivery. SOCKS5 is highly recommended.
- [n8n Integration (Community Node)](https://wasenderapi.com/api-docs/getting-started/n8n-integration-community-node): Easily automate your WhatsApp workflows using our official n8n community node. Extremely user-friendly with no API knowledge required.

## Authentication
Learn how to authenticate your API requests using the Bearer Token. This token is generated through the session management screen once the session is successfully connected.

- [How to Authenticate API Requests Using Bearer Tokens](https://wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-bearer-tokens): This guide explains how to authenticate API requests using a Bearer Token, generated after connecting your WhatsApp session through the Session Management screen.
- [How to Authenticate API Requests Using Personal Access Token](https://wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-personal-access-token): This guide explains how to authenticate API requests using a Bearer Token, generated from your settings - personal access token page.

## Sessions
Manage WhatsApp device connections through sessions. A session represents a single WhatsApp account linked to the system. Use this section to create, restore, logout, or delete sessions, as well as scan QR codes for authentication.

- [Get All WhatsApp Sessions](https://wasenderapi.com/api-docs/sessions/get-all-whatsapp-sessions): GET /api/whatsapp-sessions - Retrieves a list of all WhatsApp sessions available to the authenticated user.
- [Create WhatsApp Session](https://wasenderapi.com/api-docs/sessions/create-whatsapp-session): POST /api/whatsapp-sessions - Creates a new WhatsApp session with the provided details. Requires an active subscription and is subject to session limits.
- [Get WhatsApp Session Details](https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-details): GET /api/whatsapp-sessions/{whatsappSession} - Retrieves details for a specific WhatsApp session.
- [Update WhatsApp Session](https://wasenderapi.com/api-docs/sessions/update-whatsapp-session): PUT /api/whatsapp-sessions/{whatsappSession} - Updates details for a specific WhatsApp session. If the session is connected, webhook settings will be synced with the WhatsApp API server.
- [Delete WhatsApp Session](https://wasenderapi.com/api-docs/sessions/delete-whatsapp-session): DELETE /api/whatsapp-sessions/{whatsappSession} - Deletes a specific WhatsApp session. If the session is connected, it will attempt to disconnect from the WhatsApp API server first.
- [Get WhatsApp Session Status](https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-status): GET /api/status - Returns the current status of the WhatsApp session, including QR and Passkey linking states.
- [Connect WhatsApp Session](https://wasenderapi.com/api-docs/sessions/connect-whatsapp-session): POST /api/whatsapp-sessions/{whatsappSession}/connect - Initiates the connection process for a WhatsApp session using QR code or Passkey. QR is the default method.
- [Restart WhatsApp Session](https://wasenderapi.com/api-docs/sessions/restart-whatsapp-session): POST /api/whatsapp-sessions/{whatsappSession}/restart - Restarts a specific, currently connected WhatsApp session.
- [Get Message Logs](https://wasenderapi.com/api-docs/sessions/get-message-logs): GET /api/whatsapp-sessions/{whatsappSession}/message-logs - Retrieves a paginated list of message logs for a specific session.
- [Get Passkey Token](https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-passkey-token): GET /api/whatsapp-sessions/{whatsappSession}/passkey-token - Retrieves the temporary Passkey token and explains the recommended API flow using the Device Link Helper Chrome extension.
- [Get WhatsApp Session QR Code](https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-qr-code): GET /api/whatsapp-sessions/{whatsappSession}/qrcode - Retrieves the QR code needed to connect a WhatsApp session with the WhatsApp client. Requires an active subscription.
- [Disconnect WhatsApp Session](https://wasenderapi.com/api-docs/sessions/disconnect-whatsapp-session): POST /api/whatsapp-sessions/{whatsappSession}/disconnect - Disconnects an active WhatsApp session.
- [Get Pending Passkey Request](https://wasenderapi.com/api-docs/sessions/get-pending-passkey-request): GET /api/passkey/pending - Advanced helper endpoint used to fetch WhatsApp WebAuthn publicKey options and inspect the current Passkey request status.
- [Get Session Logs](https://wasenderapi.com/api-docs/sessions/get-session-logs): GET /api/whatsapp-sessions/{whatsappSession}/session-logs - Retrieves a paginated list of session activity logs.
- [Get Session User Info](https://wasenderapi.com/api-docs/sessions/get-session-user-info): GET /api/user - Retrieves information about the WhatsApp user associated with the current API key session.
- [Submit Passkey Response](https://wasenderapi.com/api-docs/sessions/submit-passkey-response): POST /api/passkey/response - Advanced helper endpoint used to submit a WebAuthn credential response. Most API integrations should use the Device Link Helper manual token flow instead.
- [Check if a number is on WhatsApp](https://wasenderapi.com/api-docs/sessions/check-if-a-number-is-on-whatsapp): GET /api/on-whatsapp/{phone_number} - Verifies if a given Phone Number is registered on WhatsApp.
- [Confirm Passkey Link](https://wasenderapi.com/api-docs/sessions/confirm-passkey-link): POST /api/passkey/confirm - Advanced helper endpoint used to confirm a Passkey linking request. Most API integrations should use the Device Link Helper manual token flow instead.
- [Regenerate API Key](https://wasenderapi.com/api-docs/sessions/regenerate-api-key): POST /api/whatsapp-sessions/{whatsappSession}/regenerate-key - Regenerates the API key for a specific WhatsApp session.
- [Send Presence Update](https://wasenderapi.com/api-docs/sessions/send-presence-update): POST /api/send-presence-update - Sends a presence update to a specific JID (e.g., 'typing...' or 'recording...') to indicate user activity. This requires an active session.

## Contacts
Endpoints for managing WhatsApp contacts.

- [Block Contact](https://wasenderapi.com/api-docs/contacts/block-contact): POST /api/contacts/{contactPhoneNumber}/block - Blocks a specific contact.
- [Get All Contacts](https://wasenderapi.com/api-docs/contacts/get-all-contacts): GET /api/contacts - Retrieves a list of all contacts synced with the WhatsApp session.
- [Get Contact Info](https://wasenderapi.com/api-docs/contacts/get-contact-info): GET /api/contacts/{contactPhoneNumber} - Retrieves detailed information for a specific contact.
- [Get Contact Profile Picture](https://wasenderapi.com/api-docs/contacts/get-contact-profile-picture): GET /api/contacts/{contactPhoneNumber}/picture - Retrieves the URL of the profile picture for a specific contact.
- [Unblock Contact](https://wasenderapi.com/api-docs/contacts/unblock-contact): POST /api/contacts/{contactPhoneNumber}/unblock - Unblocks a specific contact.
- [Create or Update Contact](https://wasenderapi.com/api-docs/contacts/create-or-update-contact): PUT /api/contacts - Creates or updates a contact in the session's address book.
- [Get LID from Phone Number](https://wasenderapi.com/api-docs/contacts/get-lid-from-phone-number): GET /api/lid-from-pn/{pn} - Retrieves the Link ID (LID) associated with a real phone number (PN).
- [Get Phone Number from LID](https://wasenderapi.com/api-docs/contacts/get-phone-number-from-lid): GET /api/pn-from-lid/{lid} - Retrieves the real phone number (PN) associated with a Link ID (LID).

## Messages
Send and manage WhatsApp messages using active sessions. This category covers various message types including text, image, video, audio, document, location, contact cards,

- [Decrypt Media File](https://wasenderapi.com/api-docs/messages/decrypt-media-file): POST /api/decrypt-media - This endpoint is used to decrypt media files sent in messages. You need to provide the encrypted media information, including the mediaKey and the url where the encrypted file is hosted. The API will then decrypt the file and store it temporarily, returning a publicUrl from which the decrypted file can be downloaded. This public URL will be active for one hour.
- [Upload Media File](https://wasenderapi.com/api-docs/messages/upload-media-file): POST /api/upload - This documentation details how to use the media upload endpoint, which supports both raw binary and Base64-encoded file uploads.
- [Send Text Message](https://wasenderapi.com/api-docs/messages/send-text-message): POST /api/send-message - Sends a plain text message to a recipient.
- [Send Image Message](https://wasenderapi.com/api-docs/messages/send-image-message): POST /api/send-message - Sends a message with an image attached via a URL.
- [Send Video Message](https://wasenderapi.com/api-docs/messages/send-video-message): POST /api/send-message - Sends a message with a video attached via a URL.
- [Send Document Message](https://wasenderapi.com/api-docs/messages/send-document-message): POST /api/send-message - Sends a message with a document attached via a URL.
- [Send Audio Message](https://wasenderapi.com/api-docs/messages/send-audio-message): POST /api/send-message - Sends a message with an audio file attached via a URL.
- [Send Sticker Message](https://wasenderapi.com/api-docs/messages/send-sticker-message): POST /api/send-message - Sends a message with a sticker attached via a URL (supports .webp format).
- [Send Contact Card](https://wasenderapi.com/api-docs/messages/send-contact-card): POST /api/send-message - Sends a message containing a contact card.
- [Resend Failed Message](https://wasenderapi.com/api-docs/messages/resend-failed-message): POST /api/messages/{message}/resend - Initiates the resending of a previously failed message from the logs.
- [Send Location](https://wasenderapi.com/api-docs/messages/send-location): POST /api/send-message - Sends a message containing a location pin.
- [Send Poll Message](https://wasenderapi.com/api-docs/messages/send-poll-message): POST /api/send-message - Sends a message containing a poll with multi select support.
- [Send Quoted Message](https://wasenderapi.com/api-docs/messages/send-quoted-message): POST /api/send-message - Sends a message that quotes or replies to a previous message. This is useful for creating conversational context.
- [Edit a Message](https://wasenderapi.com/api-docs/messages/edit-a-message): PUT /api/messages/{msgId} - Edits the text content of a previously sent message. Note: This is usually only possible for a short period after the message was sent.
- [Get Message Info](https://wasenderapi.com/api-docs/messages/get-message-info): GET /api/messages/{msgId}/info - Retrieves detailed information about a specific message, such as its content, sender, receiver, status and timestamps.
- [Delete a Message](https://wasenderapi.com/api-docs/messages/delete-a-message): DELETE /api/messages/{msgId} - Deletes a specific message for everyone. Note: This is usually only possible for a short period after the message was sent.
- [Mark Message as Read](https://wasenderapi.com/api-docs/messages/mark-message-as-read): POST /api/messages/read - Marks a specific received WhatsApp message as read (blue ticks).
- [Send View Once Message](https://wasenderapi.com/api-docs/messages/send-view-once-message): POST /api/send-message - Sends an image, video, or audio message that can only be viewed a single time.

## Groups
Manage WhatsApp groups directly from your connected sessions. This includes creating groups, retrieving group details, adding or removing participants, and sending messages to group chats.

- [Create a New Group](https://wasenderapi.com/api-docs/groups/create-a-new-group): POST /api/groups - Creates a new WhatsApp group with a given name and a list of participants.
- [Get All Groups](https://wasenderapi.com/api-docs/groups/get-all-groups): GET /api/groups - Retrieves a list of all WhatsApp groups the connected account is a member of.
- [Get Group Metadata](https://wasenderapi.com/api-docs/groups/get-group-metadata): GET /api/groups/{groupJid}/metadata - Retrieves metadata for a specific group (e.g., subject, description, creation date, owner).
- [Send Group Message](https://wasenderapi.com/api-docs/groups/send-group-message): POST /api/send-message - Sends a message to a specific WhatsApp group using its Group ID.
- [Update Group Participants](https://wasenderapi.com/api-docs/groups/update-group-participants): PUT /api/groups/{groupId}/participants/update - Promote or demote one or more participants in a specific group.
- [Get Group Participants](https://wasenderapi.com/api-docs/groups/get-group-participants): GET /api/groups/{groupJid}/participants - Retrieves a list of participants for a specific group. Warning: If the list is empty, it may mean no participants are currently synced or available, or the initial sync is still in progress. If you connected your session before 5/8/2025, you must reconnect it to sync them correctly.
- [Send Message with Mentions](https://wasenderapi.com/api-docs/groups/send-message-with-mentions): POST /api/send-message - Sends a message to a group that specifically mentions one or more participants.
- [Add Group Participants](https://wasenderapi.com/api-docs/groups/add-group-participants): POST /api/groups/{groupJid}/participants/add - Adds participants to a specific group. Requires admin privileges in the group.
- [Get Group Profile Picture](https://wasenderapi.com/api-docs/groups/get-group-profile-picture): GET /api/groups/{groupJid}/picture - Retrieves the URL of the profile picture for a specific group.
- [Remove Group Participants](https://wasenderapi.com/api-docs/groups/remove-group-participants): POST /api/groups/{groupJid}/participants/remove - Removes participants from a specific group. Requires admin privileges in the group.
- [Update Group Settings](https://wasenderapi.com/api-docs/groups/update-group-settings): PUT /api/groups/{groupJid}/settings - Updates settings for a specific group (e.g., subject, description, announce mode, restrict mode). Requires admin privileges.
- [Get Group Invite Link](https://wasenderapi.com/api-docs/groups/get-group-invite-link): GET /api/groups/{groupJid}/invite-link - This endpoint retrieves the invite link for a specific WhatsApp group.
- [Get Group Invite Info](https://wasenderapi.com/api-docs/groups/get-group-invite-info): GET /api/groups/invite/{inviteCode} - Retrieves metadata for a group from its invite code.
- [Accept Group Invite](https://wasenderapi.com/api-docs/groups/accept-group-invite): POST /api/groups/invite/accept - Accept a group invitation using an invite code.
- [Leave Group](https://wasenderapi.com/api-docs/groups/leave-group): POST /api/groups/{groupId}/leave - Leave a specific group that the user is a member of.

## Channels (Communities)
Manage WhatsApp Communities and their linked groups (also known as announcement channels). This section allows you to create communities, add groups to them, and control communication within a larger organized structure.

- [Send Channel Message](https://wasenderapi.com/api-docs/channels-communities/send-channel-message): POST /api/send-message - Sends a message to a specific WhatsApp channel using its Channel ID.

## Webhooks
Receive real-time updates and events from your WhatsApp sessions through webhooks. This includes incoming messages, message status updates (sent, delivered, read), group events, and session changes.

- [Webhook Setup](https://wasenderapi.com/api-docs/webhooks/webhook-setup): POST /your-webhook-url - How to set up and verify webhooks to receive real-time events.
- [Webhook: Contact Update](https://wasenderapi.com/api-docs/webhooks/webhook-contact-update): Triggered for other contact updates, such as a contact changing their profile picture or status (if available).
- [Webhook: Contact Upsert](https://wasenderapi.com/api-docs/webhooks/webhook-contact-upsert): Triggered when a new contact is added or an existing contact is updated in your session's contact list.
- [Webhook: Group Participants Update](https://wasenderapi.com/api-docs/webhooks/webhook-group-participants-update): Triggered when participants are added, removed, promoted, or demoted in a group.
- [Webhook: Group Update](https://wasenderapi.com/api-docs/webhooks/webhook-group-update): Triggered for other group-related updates, such as changes to group settings like announce mode or restrict mode by an admin.
- [Webhook: Chat Update](https://wasenderapi.com/api-docs/webhooks/webhook-chat-update): Triggered when properties of a chat are updated (e.g., unread count, mute status).
- [Webhook: Group Upsert](https://wasenderapi.com/api-docs/webhooks/webhook-group-upsert): Triggered when your session joins a new group or when metadata of an existing group (subject, description, etc.) is updated.
- [Webhook: Message Sent](https://wasenderapi.com/api-docs/webhooks/webhook-message-sent): Event triggered when a message is successfully sent from your session.
- [Webhook: Chat Delete](https://wasenderapi.com/api-docs/webhooks/webhook-chat-delete): Triggered when a chat is deleted.
- [Webhook: Chat Upsert](https://wasenderapi.com/api-docs/webhooks/webhook-chat-upsert): Triggered when a chat is created or updated (e.g., new message, read status change).
- [Webhook: Session Status](https://wasenderapi.com/api-docs/webhooks/webhook-session-status): Event triggered when the connection status of your WhatsApp session changes, including QR and Passkey linking states.
- [Webhook: Passkey Updated](https://wasenderapi.com/api-docs/webhooks/webhook-passkey-updated): Event triggered when a WhatsApp Passkey linking request changes stage.
- [Webhook: QR Code Updated](https://wasenderapi.com/api-docs/webhooks/webhook-qrcode-updated): Event triggered when a new QR code is generated for linking your session.
- [Webhook: Message Received](https://wasenderapi.com/api-docs/webhooks/webhook-message-received): Event is triggered for incoming messages, to listen for both incoming and outgoing, please refer to messages.upsert.
- [Webhook: Message Upsert](https://wasenderapi.com/api-docs/webhooks/webhook-message-upsert): Event is triggered for all messages in your session, both incoming and outgoing. To listen only for incoming events, please refer to messages.received.
- [Webhook: Group Message Received](https://wasenderapi.com/api-docs/webhooks/webhook-group-message-received): Event is triggered when a message is received in any group the session is a part of.
- [Webhook: Message Status Update](https://wasenderapi.com/api-docs/webhooks/webhook-message-update): Event triggered when a message's status is updated (e.g., delivered, read).
- [Webhook: Message Deleted](https://wasenderapi.com/api-docs/webhooks/webhook-message-deleted): Event triggered when a message is deleted.
- [Webhook: Newsletter Message Received](https://wasenderapi.com/api-docs/webhooks/webhook-newsletter-message-received): Event is triggered when a message is received in a newsletter (channel) the session is subscribed to.
- [Webhook: Message Receipt Update](https://wasenderapi.com/api-docs/webhooks/webhook-message-receipt-update): Event triggered specifically for message receipt status changes.
- [Webhook: Personal Message Received](https://wasenderapi.com/api-docs/webhooks/webhook-personal-message-received): Event is triggered when a message is received in a personal (one-to-one) chat.
- [Webhook: Call Received](https://wasenderapi.com/api-docs/webhooks/webhook-call-received): Event is triggered for an incoming voice or video call.
- [Webhook: Message Reaction](https://wasenderapi.com/api-docs/webhooks/webhook-message-reaction): Event triggered when someone reacts to a message.
- [Webhook: Poll Results](https://wasenderapi.com/api-docs/webhooks/webhook-poll-results): This webhook is triggered when there is an update to a poll, such as when a user casts a vote.

## Responses & Errors
Understand the structure of API responses and how to handle errors effectively. This section outlines standard success responses, common error formats, status codes, and tips for debugging failed requests.

- [Response Headers](https://wasenderapi.com/api-docs/responses-errors/response-headers): Information about standard headers included in API responses, particularly rate limiting.
- [Error Responses](https://wasenderapi.com/api-docs/responses-errors/error-responses): Common error responses returned by the API.

## Rate Limits
Learn how API rate limiting works to ensure fair usage and system stability. This section explains the allowed number of requests per time window, how to identify throttling, and how to handle rate limit responses.

- [Understanding Rate Limits](https://wasenderapi.com/api-docs/rate-limits/understanding-rate-limits): Details on the rate limits applied to API requests based on subscription plans.

## API Reference

Base URL: https://wasenderapi.com
Authentication: Send your API key as a bearer token in the Authorization header.

Example header:
Authorization: Bearer YOUR_API_KEY

### Official SDKs – Node.js, Python & Laravel

URL: https://wasenderapi.com/api-docs/developer-sdks/official-sdks-nodejs-python-laravel
Description: WasenderAPI provides official SDKs to help developers integrate quickly and efficiently using their preferred programming language or framework.

Details:
Official SDKs – Node.js, Python & Laravel

 WasenderAPI provides official SDKs to help developers integrate quickly and efficiently using their preferred programming language or framework.

 Node.js SDK

 Install the Node.js SDK using npm:

 npm install wasenderapi

 View full documentation and usage examples on

 npmjs.com
 .

 Python SDK

 Install the Python SDK using pip:

 pip install wasenderapi

 View full documentation and usage examples on

 PyPI
 .

 Laravel SDK

 Install the Laravel SDK using Composer:

 composer require wasenderapi/wasenderapi-laravel

 View the package and installation details on

 Packagist
 .

### Getting Started with WasenderAPI

URL: https://wasenderapi.com/api-docs/getting-started/getting-started-with-wasenderapi
Description: Learn how to quickly set up your WasenderAPI account and start sending WhatsApp messages in minutes. This guide covers account creation, token generation, sending your first message, and tracking delivery using our developer-friendly REST API.

Details:
Getting Started with WasenderAPI – WhatsApp Messaging API

 Introduction

 Welcome to WasenderAPI – your reliable WhatsApp API platform. This guide will walk you through the steps to set up and start sending messages using our powerful API. It's quick, secure, and developer-friendly.

 Step 1: Create an Account

 - Go to the registration page.

 - Fill in your details and verify your email address.

 - Once verified, log in to access your dashboard.

 Step 2: Create Your First WhatsApp Session

 - Log In to Your Dashboard: Access your account at wasenderapi.com/dashboard.

 - Navigate to the Sessions Section: In the dashboard, go to the Sessions tab.

 - Create a New Session: Click on Create New Session.

 - Scan the QR Code: A QR code will appear. Open WhatsApp on your phone, go to Settings > Linked Devices, and scan the QR code to link your WhatsApp account.

 - Session Activation: Once scanned, your session will connected, and you can copy your API key.

 For a more advanced walkthrough, check out the detailed guide here:

 Creating Your First Session – WasenderAPI Help Center

 Step 3: Send Your First Message

 API Endpoint

 POST https://www.wasenderapi.com/api/send-message

 Headers

 Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

 Request Body

 {
 "to": "212612345678",
 "text": "Hello from WasenderAPI!"
}

 Note: The number you're messaging must have agreed to receive WhatsApp messages.

 Step 4: Track Message Delivery

 You can track the status of your messages through the session page or set up webhooks for real-time updates.

 Need Help?

 Check out our Help Center or reach out to our support team at contact@wasenderapi.com.

 Go to Dashboard

### Using Our API with Postman

URL: https://wasenderapi.com/api-docs/getting-started/using-our-api-with-postman
Description: Learn how to interact with our API using the official Postman collection.

Details:
Postman Collection for API Integration

 To help you get started quickly, we've prepared a Postman collection that contains all our API endpoints. You can use it to test requests and understand how the API works.

 Option 1: Run in Postman

 Click the button below to open the collection directly in Postman:

 Run in Postman

 Option 2: Download Collection

 If you'd rather import it manually, download the collection below:

 Download JSON File

 Tip: Make sure you're logged into your Postman account for the best experience.

 Need Help?

 Visit our Getting Started section for a walkthrough on authentication, headers, and example requests.

### How To Receive Messages and Media From Wasenderapi

URL: https://wasenderapi.com/api-docs/getting-started/how-to-receive-messages-and-media-from-wasenderapi
Description: A developer's guide to receiving and processing real-time message events. This documentation details the flattened JSON payload, unified messageBody field, and handling for both Private and Group chats.

Details:
How to Handle Incoming WhatsApp Messages

 When you get a new WhatsApp message, we send a POST request to your server (webhook). Inside is a JSON payload with all the message details.

 The Message Payload

 The JSON structure has been updated. The data.messages field is now a single object (not an array) containing the normalized key, the unified messageBody, and the raw message content.

 {
 "event": "messages.received",
 "timestamp": 1633456789,
 "data": {
 "messages": {
 "key": {
 "id": "3EB0X123456789",
 "fromMe": false,
 "remoteJid": "123456789@lid",
 "cleanedSenderPn": "5551234567",
 "senderLid": "123456789@lid"
 },
 "messageBody": "Hello! This is a test.",
 "message": {
 "conversation": "Hello! This is a test."
 }
 }
 }
}

 Key Fields Explained:

 - key.cleanedSenderPn: (Recommended) The sender's phone number in private chats. Use this for your database or logic.

 - key.cleanedParticipantPn: (Recommended) The sender's phone number in group chats.

 - key.remoteJid: The unique ID of the chat.

 ⚠️ Important: Do not rely on remoteJid to be a phone number. It can often be a LID (Linked ID, ending in @lid). Always use the "cleaned" fields if you need the specific phone number.

 - messageBody: The unified text content of the message. Whether it's a text message, an image caption, or a reply, the text will always be here.

 Reading the Message Content

 1. The Easy Way (Text)

 You no longer need to check multiple fields (like conversation vs extendedTextMessage). Just use data.messages.messageBody.

 2. Media Messages

 For media, look inside the raw data.messages.message object for keys like imageMessage, videoMessage, or audioMessage.

 How to Decrypt Media Files

 Important Update: You no longer have to decrypt the media yourself if you don’t want to. We now provide a secure API endpoint that does it for you automatically: Decrypt Media File API.

 If you choose to decrypt manually, use the code examples below.

Code examples:
```php
<?php

declare(strict_types=1);

// The directory to save downloaded media files.
// Make sure this directory exists and your web server can write to it.
define('DOWNLOAD_DIR', __DIR__ . '/downloads');

/**
 * A simple logging function for demonstration.
 * In a real application, you would use a proper logger like Monolog.
 */
function logMessage(string $message): void
{
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('webhook.log', "[$timestamp] $message\n", FILE_APPEND);
}

/**
 * Finds the first available media object and its type from the message.
 */
function findMediaInfo(array $messageObject): ?array
{
    $mediaKeys = [
        'imageMessage'    => 'image',
        'videoMessage'    => 'video',
        'audioMessage'    => 'audio',
        'documentMessage' => 'document',
        'stickerMessage'  => 'sticker',
    ];

    foreach ($mediaKeys as $key => $type) {
        if (isset($messageObject[$key])) {
            return [$messageObject[$key], $type];
        }
    }
    return null;
}

/**
 * Downloads a file from a URL.
 */
function downloadFile(string $url)
{
    $context = stream_context_create(['http' => ['follow_location' => true]]);
    return file_get_contents($url, false, $context);
}

/**
 * Derives the decryption keys using HKDF.
 */
function getDecryptionKeys(string $mediaKey, string $mediaType): string
{
    $info = match ($mediaType) {
        'image', 'sticker' => 'WhatsApp Image Keys',
        'video'           => 'WhatsApp Video Keys',
        'audio'           => 'WhatsApp Audio Keys',
        'document'        => 'WhatsApp Document Keys',
        default           => throw new Exception("Invalid media type: {$mediaType}"),
    };
    
    return hash_hkdf('sha256', base64_decode($mediaKey), 112, $info, '');
}

/**
 * Main function to decrypt and save a media file.
 */
function handleMediaDecryption(array $mediaInfo, string $mediaType, string $messageId): void
{
    $url = $mediaInfo['url'] ?? null;
    $mediaKey = $mediaInfo['mediaKey'] ?? null;
    
    if (!$url || !$mediaKey) {
        throw new Exception("Media object is missing url or mediaKey.");
    }

    $encryptedData = downloadFile($url);
    if (!$encryptedData) {
        throw new Exception("Failed to download media from URL: {$url}");
    }

    $keys = getDecryptionKeys($mediaKey, $mediaType);
    $iv = substr($keys, 0, 16);
    $cipherKey = substr($keys, 16, 32);
    $ciphertext = substr($encryptedData, 0, -10);

    $decryptedData = openssl_decrypt($ciphertext, 'aes-256-cbc', $cipherKey, OPENSSL_RAW_DATA, $iv);
    if ($decryptedData === false) {
        throw new Exception('Failed to decrypt media.');
    }

    if (!is_dir(DOWNLOAD_DIR)) {
        mkdir(DOWNLOAD_DIR, 0755, true);
    }
    $mimeType = $mediaInfo['mimetype'] ?? 'application/octet-stream';
    $extension = explode('/', $mimeType)[1] ?? 'bin';
    $filename = $mediaInfo['fileName'] ?? "{$messageId}.{$extension}";
    $outputPath = DOWNLOAD_DIR . '/' . basename($filename);
    
    file_put_contents($outputPath, $decryptedData);
    logMessage("Successfully decrypted and saved media to: {$outputPath}");
}

// --- MAIN WEBHOOK PROCESSING LOGIC ---

$jsonPayload = file_get_contents('php://input');
$payload = json_decode($jsonPayload, true);

// 1. Access data.messages (Direct Object Access)
$messageData = $payload['data']['messages'] ?? null;

if (!$messageData) {
    logMessage('Webhook received but no message data found.');
    http_response_code(200);
    exit();
}

$key = $messageData['key'] ?? [];
$messageId = $key['id'] ?? 'unknown_id';

// 2. Identify Sender (Group vs Private)
$sender = $key['cleanedParticipantPn'] ?? $key['cleanedSenderPn'] ?? $key['remoteJid'];

// 3. Get Unified Text Body
$messageContent = $messageData['messageBody'] ?? '';

logMessage("Processing message from {$sender}. ID: {$messageId}");

if (!empty($messageContent)) {
    logMessage("Text: {$messageContent}");
    // TODO: Save text message to your database here.
}

// 4. Handle Media
$mediaInfo = findMediaInfo($messageData['message'] ?? []);
if ($mediaInfo) {
    try {
        logMessage("Media found. Type: {$mediaInfo[1]}. Attempting to decrypt...");
        handleMediaDecryption($mediaInfo[0], $mediaInfo[1], $messageId);
    } catch (Exception $e) {
        logMessage("ERROR processing media: " . $e->getMessage());
    }
}

http_response_code(200);
logMessage("--- Finished processing webhook ---");
```
```javascript
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

// The directory to save downloaded media files.
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

function logMessage(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

function findMediaInfo(messageObject) {
    const mediaKeys = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        documentMessage: 'document',
        stickerMessage: 'sticker',
    };

    for (const key in mediaKeys) {
        if (messageObject && messageObject[key]) {
            return [messageObject[key], mediaKeys[key]];
        }
    }
    return null;
}

function getDecryptionKeys(mediaKeyBuffer, mediaType) {
    const infoMap = {
        image: 'WhatsApp Image Keys',
        sticker: 'WhatsApp Image Keys',
        video: 'WhatsApp Video Keys',
        audio: 'WhatsApp Audio Keys',
        document: 'WhatsApp Document Keys',
    };

    const info = infoMap[mediaType];
    if (!info) {
        throw new Error(`Invalid media type: ${mediaType}`);
    }

    return new Promise((resolve, reject) => {
        crypto.hkdf('sha256', mediaKeyBuffer, '', info, 112, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(Buffer.from(derivedKey));
        });
    });
}

async function handleMediaDecryption(mediaInfo, mediaType, messageId) {
    const { url, mediaKey } = mediaInfo;
    if (!url || !mediaKey) {
        throw new Error("Media object is missing url or mediaKey.");
    }

    // 1. Download the encrypted file
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const encryptedData = Buffer.from(response.data);

    // 2. Derive the IV and Cipher Key
    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');
    const keys = await getDecryptionKeys(mediaKeyBuffer, mediaType);
    const iv = keys.slice(0, 16);
    const cipherKey = keys.slice(16, 48);

    // 3. Decrypt
    const ciphertext = encryptedData.slice(0, -10);
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // 4. Save the decrypted file
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
    const extension = mediaInfo.mimetype ? mediaInfo.mimetype.split('/')[1] : 'bin';
    const filename = mediaInfo.fileName || `${messageId}.${extension}`;
    const outputPath = path.join(DOWNLOAD_DIR, path.basename(filename));

    await fs.writeFile(outputPath, decryptedData);
    logMessage(`Successfully decrypted and saved media to: ${outputPath}`);
}

async function processWebhook(payload) {
    try {
        // 1. Access data.messages (Direct Object Access)
        const messageData = payload?.data?.messages;
        if (!messageData) {
            logMessage('Webhook received but no message data found.');
            return;
        }

        const key = messageData.key || {};
        const messageId = key.id || 'unknown_id';

        // 2. Identify Sender (Group vs Private)
        const sender = key.cleanedParticipantPn || key.cleanedSenderPn || key.remoteJid;
        
        // 3. Get Unified Text
        const messageContent = messageData.messageBody;
        const mediaInfo = findMediaInfo(messageData.message);

        if (!messageContent && !mediaInfo) {
            logMessage(`Ignoring event with no content (ID: ${messageId})`);
            return;
        }

        logMessage(`Processing message from ${sender}. ID: ${messageId}`);

        if (messageContent) {
            logMessage(`Text: ${messageContent}`);
        }

        if (mediaInfo) {
            logMessage(`Media found. Type: ${mediaInfo[1]}. Attempting to decrypt...`);
            await handleMediaDecryption(mediaInfo[0], mediaInfo[1], messageId);
        }
    } catch (error) {
        logMessage(`ERROR processing webhook: ${error.message}`);
    } finally {
        logMessage("--- Finished processing webhook ---");
    }
}
// processWebhook(samplePayload);
```
```python
import os
import json
import base64
import requests
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), 'downloads')

def log_message(message):
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] {message}")

def find_media_info(message_object):
    media_keys = {
        'imageMessage': 'image',
        'videoMessage': 'video',
        'audioMessage': 'audio',
        'documentMessage': 'document',
        'stickerMessage': 'sticker',
    }
    if not message_object:
        return None
    for key, type_str in media_keys.items():
        if key in message_object:
            return message_object[key], type_str
    return None

def get_decryption_keys(media_key, media_type):
    info_map = {
        'image': b'WhatsApp Image Keys',
        'sticker': b'WhatsApp Image Keys',
        'video': b'WhatsApp Video Keys',
        'audio': b'WhatsApp Audio Keys',
        'document': b'WhatsApp Document Keys',
    }
    info = info_map.get(media_type)
    if not info:
        raise ValueError(f"Invalid media type: {media_type}")

    media_key_bytes = base64.b64decode(media_key)
    hkdf = HKDF(
        algorithm=hashes.SHA256(),
        length=112,
        salt=b'',
        info=info,
        backend=default_backend()
    )
    return hkdf.derive(media_key_bytes)

def handle_media_decryption(media_info, media_type, message_id):
    url = media_info.get('url')
    media_key = media_info.get('mediaKey')
    if not url or not media_key:
        raise ValueError("Media object is missing url or mediaKey.")

    response = requests.get(url)
    response.raise_for_status()
    encrypted_data = response.content

    keys = get_decryption_keys(media_key, media_type)
    iv = keys[:16]
    cipher_key = keys[16:48]
    ciphertext = encrypted_data[:-10]

    cipher = Cipher(algorithms.AES(cipher_key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()

    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    extension = media_info.get('mimetype', 'application/octet-stream').split('/')[-1]
    filename = media_info.get('fileName') or f"{message_id}.{extension}"
    output_path = os.path.join(DOWNLOAD_DIR, os.path.basename(filename))
    
    with open(output_path, 'wb') as f:
        f.write(decrypted_data)
    log_message(f"Successfully decrypted and saved media to: {output_path}")

def process_webhook(payload):
    try:
        # 1. Access data.messages (Direct Object Access)
        data = payload.get('data', {})
        message_data = data.get('messages')
        if not message_data:
            log_message('Webhook received but no message data found.')
            return

        key = message_data.get('key', {})
        message_id = key.get('id', 'unknown_id')

        # 2. Identify Sender
        sender = key.get('cleanedParticipantPn') or key.get('cleanedSenderPn') or key.get('remoteJid')

        # 3. Get Unified Text
        message_content = message_data.get('messageBody')
        media_result = find_media_info(message_data.get('message', {}))
        
        if not message_content and not media_result:
            log_message(f"Ignoring event with no content (ID: {message_id})")
            return

        log_message(f"Processing message from {sender}. ID: {message_id}")
        
        if message_content:
            log_message(f"Text: {message_content}")
            
        if media_result:
            media_info, media_type = media_result
            log_message(f"Media found. Type: {media_type}. Decrypting...")
            handle_media_decryption(media_info, media_type, message_id)

    except Exception as e:
        log_message(f"ERROR processing webhook: {e}")
    finally:
        log_message("--- Finished processing webhook ---")

if __name__ == "__main__":
    try:
        with open('sample.json', 'r') as f:
            process_webhook(json.load(f))
    except Exception as e:
        print(e)
```
```n8n code - javascript
const crypto = require('crypto');

function getDecryptionKeys(mediaKeyBuffer, mediaType) {
    const infoMap = {
        image: 'WhatsApp Image Keys', sticker: 'WhatsApp Image Keys',
        video: 'WhatsApp Video Keys', audio: 'WhatsApp Audio Keys',
        document: 'WhatsApp Document Keys',
    };
    const info = infoMap[mediaType];
    if (!info) throw new Error(`Invalid media type: ${mediaType}`);
    return new Promise((resolve, reject) => {
        crypto.hkdf('sha256', mediaKeyBuffer, '', Buffer.from(info), 112, (err, key) => {
            if (err) return reject(err);
            resolve(Buffer.from(key));
        });
    });
}

try {
    const item = items[0];
    
    // 1. Access body.data.messages directly (Object)
    const messageData = item.json.body?.data?.messages;
    const message = messageData?.message;

    if (!message) {
        return null; 
    }

    let mediaDetails;
    let mediaType = '';

    if (message.imageMessage) {
        mediaType = 'image';
        mediaDetails = message.imageMessage;
    } else if (message.audioMessage) {
        mediaType = 'audio';
        mediaDetails = message.audioMessage;
    } else if (message.videoMessage) {
        mediaType = 'video';
        mediaDetails = message.videoMessage;
    } else if (message.documentMessage) {
        mediaType = 'document';
        mediaDetails = message.documentMessage;
    }

    if (!mediaDetails) {
        return null;
    }

    const mediaUrl = mediaDetails.url;
    const mediaKey = mediaDetails.mediaKey;
    const response = await this.helpers.httpRequest({ url: mediaUrl, method: 'GET', encoding: 'arraybuffer' });
    const encryptedData = Buffer.from(response);

    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');
    const keys = await getDecryptionKeys(mediaKeyBuffer, mediaType);
    const iv = keys.slice(0, 16);
    const cipherKey = keys.slice(16, 48);
    const ciphertext = encryptedData.slice(0, -10);

    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decryptedData = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const mimeType = mediaDetails.mimetype;
    const fileName = mediaDetails.fileName || crypto.randomUUID();
    const extension = mimeType.split('/')[1].split(';')[0].trim() || 'bin';
    const finalFileNameWithExt = `${fileName}.${extension}`;

    const binaryData = await this.helpers.prepareBinaryData(decryptedData, finalFileNameWithExt, mimeType);
    item.binary = { data: binaryData };
    item.json.decryptionSuccess = true;
      
    return item;

} catch (error) {
    throw error;
}
```
```Csharp
using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

// ... [Omitted Helper Classes like WhatsAppMediaHandler] ...
// ... [Assume standard decryption logic from previous examples] ...

public class WebhookPayload
{
    [JsonPropertyName("data")]
    public WebhookData? Data { get; set; }
}

public class WebhookData
{
    // 1. Messages is now a single Object, not a List
    [JsonPropertyName("messages")]
    public MessageData? Messages { get; set; }
}

public class MessageData
{
    [JsonPropertyName("key")]
    public MessageKey? Key { get; set; }
    
    [JsonPropertyName("messageBody")]
    public string? MessageBody { get; set; }
    
    [JsonPropertyName("message")]
    public Message? Message { get; set; }
}

public class MessageKey
{
    [JsonPropertyName("remoteJid")]
    public string RemoteJid { get; set; } = string.Empty;

    [JsonPropertyName("cleanedSenderPn")]
    public string? CleanedSenderPn { get; set; }

    [JsonPropertyName("cleanedParticipantPn")]
    public string? CleanedParticipantPn { get; set; }
    
    [JsonPropertyName("id")]
    public string? Id { get; set; }
}

public static async Task ProcessWebhookAsync(WebhookPayload payload)
{
    try
    {
        var data = payload?.Data;
        var messageData = data?.Messages;

        if (messageData == null)
        {
            Console.WriteLine("No message data found.");
            return;
        }

        var key = messageData.Key;
        if (key == null) return;

        // 2. Identify Sender
        string sender = key.CleanedParticipantPn ?? key.CleanedSenderPn ?? key.RemoteJid;
        
        // 3. Get Unified Text
        string messageContent = messageData.MessageBody;

        Console.WriteLine($"Processing message from {sender}");

        if (!string.IsNullOrEmpty(messageContent))
        {
            Console.WriteLine($"Text: {messageContent}");
        }

        // 4. Handle Media
        // var (mediaInfo, mediaType) = FindMediaInfo(messageData.Message);
        // ... Call decryption ...
    }
    catch (Exception error)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}
```

### Model Context Protocol (MCP) Integration

URL: https://wasenderapi.com/api-docs/getting-started/model-context-protocol-mcp-integration
Description: Connect WasenderAPI to AI agents and automation tools using the Model Context Protocol. This remote MCP server exposes WhatsApp session management, messaging, contacts, and groups as callable tools for Claude Code, OpenCode, n8n, and other MCP-compatible platforms. Requires a paid plan and Personal Access Token for authentication.

Details:
WasenderAPI MCP Integration Guide

 Add the WasenderAPI MCP to your favorite tools (Claude Code/Desktop/CLI, OpenCode, or n8n) using your Personal Access Token.

 MCP integration is only available on paid plans. This feature is not available on trial accounts.

 Replace YOUR_PERSONAL_ACCESS_TOKEN with the token from your WasenderAPI account settings. Keep it secret.

 Claude Code / Desktop / CLI

 - Ensure the Claude CLI is installed and logged in.

 - Register the MCP using your token:

 claude mcp add --transport http wasenderapi https://wasenderapi.com/mcp \
 --header "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"

 - Verify it appears with claude mcp list and start a new Claude Code session; the WasenderAPI tools will be available.

 OpenCode

 - Open your OpenCode config (defaults to ~/.config/opencode/config.json).

 - Paste the configuration snippet below under the "mcp" key:

 {
 "mcp": {
 "WasenderAPI": {
 "type": "remote",
 "url": "https://wasenderapi.com/mcp",
 "enabled": true,
 "headers": {
 "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
 }
 }
 },
 "$schema": "https://opencode.ai/config.json"
}

 - Restart or reload OpenCode. The WasenderAPI MCP will show up as WasenderAPI.

 If you already have other MCP entries, just add the "WasenderAPI" block alongside them.

 n8n (MCP Client Tool Node)

 Requires n8n v2.0 or later. n8n ships an MCP Tool node that can call external MCP servers.

 - Install/upgrade to n8n v2.0+

 - Create a new workflow and add the MCP Client Tool node.

 - Configure MCP endpoint: https://wasenderapi.com/mcp.

 - Add header Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN.

 - Pick the desired tool (e.g., send-message, contacts, groups).

 - Execute the node; n8n will call the MCP tool and return the response.

 Ensure your WasenderAPI session is connected and the token is valid before running.

 Available Tools (MCP)

 The WasenderAPI MCP exposes the following tools for AI agents:

 Sessions Management

 - list_whatsapp_sessions – Retrieve all WhatsApp sessions with pagination.

 - get_specific_whatsapp_session – Retrieve details of a specific session by ID.

 - get_session_user – Get information about the WhatsApp user associated with a session.

 - create_whatsapp_session – Create a new WhatsApp session.

 - update_whatsapp_session – Update a specific WhatsApp session.

 - connect_whatsapp_session – Start/connect a WhatsApp session (returns QR code if needed).

 - disconnect_whatsapp_session – Disconnect a WhatsApp session.

 - get_message_logs – Retrieve message logs for a specific session.

 - get_session_logs – Retrieve session logs for a specific session.

 Messaging

 - send_text_message – Send a text message via a specified session.

 - send_mention_text_message – Send a text message with mentions.

 - send_image_message – Send an image message via WhatsApp.

 - send_audio_message – Send an audio message (voice note or audio file).

 - send_video_message – Send a video message via WhatsApp.

 - send_document_message – Send a document/file via WhatsApp.

 - send_location_message – Send a location message via WhatsApp.

 - send_contact_message – Send a contact card via WhatsApp.

 - send_poll_message – Send a poll via WhatsApp.

 - send_presence_update – Send a presence update (available, unavailable, composing, recording, paused).

 - resend_message – Resend a failed WhatsApp message.

 - edit_message – Edit an existing WhatsApp message.

 - delete_message – Delete a WhatsApp message.

 - get_message_info – Get information about a specific message (delivery status, read receipts).

 Contacts

 - list_contacts – List all WhatsApp contacts for a specified session.

 - add_or_edit_contact – Add a new contact or edit an existing contact in WhatsApp.

 - get_contact_info – Get information about a specific WhatsApp contact.

 - get_contact_picture – Get the profile picture URL of a WhatsApp contact.

 - block_contact – Block a WhatsApp contact.

 - unblock_contact – Unblock a WhatsApp contact.

 - check_jid_on_whatsapp – Check if a phone number/JID exists on WhatsApp.

 - get_lid_from_phone_number – Get the LID (Linked Device ID) for a given phone number.

 - get_phone_number_from_lid – Get the phone number for a given LID.

 - search_contacts – Search for WhatsApp contacts by name or phone number.

 Groups

 - list_groups – List all WhatsApp groups for a specified session.

 - create_group – Create a new WhatsApp group with specified name and participants.

 - get_group_metadata – Get metadata for a specific group (name, description, participants).

 - get_group_participants – Get participants of a specific WhatsApp group.

 - add_group_participants – Add participants to a WhatsApp group.

 - remove_group_participants – Remove participants from a WhatsApp group.

 - update_group_participants – Promote or demote participants in a WhatsApp group.

 - update_group_settings – Update settings for a WhatsApp group (subject, description, announce mode, etc.).

 - leave_group – Leave a WhatsApp group.

 - generate_invite_link – Generate an invite link for a WhatsApp group.

 - accept_group_invite – Accept a WhatsApp group invite by code.

 - search_groups – Search for WhatsApp groups by name.

 Documentation

 - get_api_documentation_tool – Get API documentation. Returns index of all APIs if no ID provided, or detailed docs for a specific entry.

Code examples:
```json
{
  "mcp": {
    "WasenderAPI": {
      "type": "remote",
      "url": "https://wasenderapi.com/mcp",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

### Using Proxies

URL: https://wasenderapi.com/api-docs/getting-started/using-proxies
Description: Learn how to configure proxies for your WhatsApp sessions to prevent frequent disconnects and ensure fast, reliable message delivery. SOCKS5 is highly recommended.

Details:
Configuring Proxies for WhatsApp Sessions

 Using a proxy helps mask our server's IP address and routes your session's traffic through a dedicated IP, which helps with connection stability. Proxies can be configured individually per session.

 Supported Protocols: We support http://, https://, and socks5:// proxies, but SOCKS5 is highly recommended for the best performance and seamless compatibility with WhatsApp.

 Best Practices & Recommendations

 To ensure your sessions remain stable, please follow these guidelines when selecting a proxy:

 - Location Matching: Always use a proxy located in the same country as the phone number registered to the WhatsApp session.

 - Sticky IPs: Use a sticky proxy (an IP that remains the same for a prolonged period) rather than a frequently rotating proxy.

 - Speed is Key: Ensure your proxy is fast and has low latency. Slow proxies will cause connection timeouts and lead to session not ready errors.

 Configuration via Dashboard

 You can easily assign a proxy to a session without writing any code:

 - Navigate to your dashboard and go to Sessions.

 - Click Edit Session on the session you want to modify.

 - Locate the Proxy URL field.

 - Enter your proxy string (e.g., socks5://user:pass@192.168.1.1:1080) and save.

 Configuration via API

 You can also programmatically update a session's proxy using our REST API.

 Authentication Note: Because updating a session's core configuration is an account-level action, you must authenticate this request using your Personal Access Token (found in your profile settings), not the Session API Key.

 Make a PUT request to the session endpoint with your proxy URL (example below)

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}" 
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
      "proxy_url": "socks5://username:password@ip:port"
  }'
```

### n8n Integration (Community Node)

URL: https://wasenderapi.com/api-docs/getting-started/n8n-integration-community-node
Description: Easily automate your WhatsApp workflows using our official n8n community node. Extremely user-friendly with no API knowledge required.

Details:
n8n Community Node Integration

 We are thrilled to announce our official n8n Community Node! This node makes it incredibly easy to integrate WasenderAPI into your n8n workflows. It is extremely user-friendly and completely bypasses the need for deep API knowledge or complex HTTP requests.

 NPM Package: n8n-nodes-wasenderapi

 1. Get Your Personal Access Token

 To use the n8n node, you need to authenticate using your Personal Access Token. This token allows the node to manage your sessions, fetch dynamic lists, and send messages seamlessly behind the scenes.

 Important: Do not use a Session API Key for the n8n node. You must use the Personal Access Token.

 - Log into your WasenderAPI dashboard.

 - Navigate to Settings > Personal Access Token.

 - Click Generate to create a new token.

 - Copy the token and keep it secure. You will need this to set up your credentials inside n8n.

 2. Install the Node in n8n

 Installing a community node in n8n is quick and easy directly from the UI:

 - Open your n8n instance.

 - Navigate to Settings (the gear icon on the left sidebar) > Community Nodes.

 - Click Install a community node.

 - Enter the exact package name: n8n-nodes-wasenderapi

 - Check the "I understand the risks" acknowledgment box and click Install.

 Self-hosted Docker users: If you prefer managing nodes via environment variables, you can install it by adding n8n-nodes-wasenderapi to your N8N_CUSTOM_EXTENSIONS variable.

 3. Using the Node in Your Workflow

 Once installed, you can start building powerful automations immediately!

 - Open a workflow and click the + Add node button.

 - Search for WasenderAPI and add it to your canvas.

 - Click on the node to open its configuration panel.

 - Under Credentials, select "Create New Credential". Paste the Personal Access Token you generated in Step 1.

 - Select the Resource (e.g., Message, Session, Contact, Group) and the Operation (e.g., Send Message, Create Session) you want to perform.

 - Fill in the required fields. The node will dynamically load your active sessions, making it just a matter of pointing and clicking!

### How to Authenticate API Requests Using Bearer Tokens

URL: https://wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-bearer-tokens
Description: This guide explains how to authenticate API requests using a Bearer Token, generated after connecting your WhatsApp session through the Session Management screen.

Details:
Authentication

 All WasenderAPI endpoints are secured and require authentication via an API Key. This API key is automatically generated when you create or restore a session from the Session Management screen.

 Obtaining Your API Key

 Once your WhatsApp session is connected, a unique API Key will be available. This API Key must be included in the Authorization header for every API request.

 Authorization Header Format

 Authorization: Bearer token YOUR_SESSION_API_KEY

 Replace YOUR_SESSION_API_KEY with the API key you received from the session screen.

 ℹ️ API Keys are tied to a specific session. If the session is deleted, the key becomes invalid.

 Keep your API Key private. Avoid exposing it in public repositories or frontend code.

Parameters:
- Authorization (string, required): Bearer token obtained after session connection. Format: Bearer YOUR_SESSION_API_JEY

Response examples:
No API KEY Response:
```json
{
 "success": false,
 "message": "API key is required"
}
```
Invalid API KEY Response:
```json
{
 "success": false,
 "message": "Invalid API key"
}
```

### How to Authenticate API Requests Using Personal Access Token

URL: https://wasenderapi.com/api-docs/authentication/how-to-authenticate-api-requests-using-personal-access-token
Description: This guide explains how to authenticate API requests using a Bearer Token, generated from your settings - personal access token page.

Details:
Authentication
 To authenticate account-level requests on WasenderAPI, you must use a Personal Access Token.
 What Is a Personal Access Token?
 A Personal Access Token (PAT) is used to authorize access to your account-level endpoints, such as:
 - Creating or deleting WhatsApp sessions
 - Listing all existing sessions
 - Accessing user account information

 Where to Get It
 You can generate and manage your Personal Access Token from the Settings > Personal Access Token page in your Wasender dashboard.
 Authorization Header Format
 Include your token in the Authorization header of your HTTP requests using the following format:
 Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN
 Replace YOUR_PERSONAL_ACCESS_TOKEN with the token you obtained from the settings page.
 ⚠️ Your Personal Access Token provides full access to your account. Keep it confidential and avoid sharing or exposing it in public code repositories or frontend code.

Parameters:
- Authorization (string, required): Bearer token obtained from the settings - personal access token page . Format: Bearer YOUR_PERSONAL_ACCESS_TOKEN

Response examples:
No API KEY Response:
```json
{
 "success": false,
 "message": "Unnotarized"
}
```

### Get All WhatsApp Sessions

URL: https://wasenderapi.com/api-docs/sessions/get-all-whatsapp-sessions
Endpoint: GET /api/whatsapp-sessions
Description: Retrieves a list of all WhatsApp sessions available to the authenticated user.

Details:
Get All WhatsApp Sessions

 Retrieves a list of all WhatsApp sessions available to the authenticated user.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Business WhatsApp",
            "phone_number": "+1234567890",
            "status": "connected",
            "account_protection": true,
            "log_messages": true,
            "webhook_url": "https:\/\/example.com\/webhook",
            "webhook_enabled": true,
            "webhook_events": [
                "message",
                "group_update"
            ],
            "created_at": "2025-04-01T12:00:00Z",
            "updated_at": "2025-05-08T15:30:00Z"
        },
        {
            "id": 2,
            "name": "Support WhatsApp",
            "phone_number": "+9876543210",
            "status": "DISCONNECTED",
            "account_protection": false,
            "log_messages": false,
            "webhook_url": null,
            "webhook_enabled": false,
            "webhook_events": null,
            "created_at": "2025-04-15T09:45:00Z",
            "updated_at": "2025-05-07T11:20:00Z"
        }
    ]
}
```

### Create WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/create-whatsapp-session
Endpoint: POST /api/whatsapp-sessions
Description: Creates a new WhatsApp session with the provided details. Requires an active subscription and is subject to session limits.

Details:
Create WhatsApp Session

 Creates a new WhatsApp session with the provided details. Requires an active subscription and is subject to session limits.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- name (string, required): Name of the WhatsApp session.
- phone_number (string, required): Phone number in international format.
- account_protection (boolean, required): Enable account protection features.
- log_messages (boolean, required): Enable message logging.
- webhook_url (string, optional): URL for receiving webhook notifications.
- webhook_enabled (boolean, optional): Enable webhook notifications.
- webhook_events (array, optional): Array of events to receive webhook notifications for.
- read_incoming_messages (boolean, optional): Enable the option to automatically mark messages as read when they are received.
- auto_reject_calls (boolean, optional): Enable automatic rejection of incoming calls.
- ignore_groups (boolean, optional): ignore all webhook events from groups.
- ignore_channels (boolean, optional): ignore all webhook events from channels (newsletters).
- ignore_broadcasts (boolean, optional): ignore all webhook events from broadcast lists.
- proxy_url (string, optional): Allowed protocols: http, https, socks5. Use a public domain only (IP addresses and local/private networks are blocked).
- always_online (boolean, optional): When enabled, your session will always appear online to your contacts, even when you're not actively using WhatsApp.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
  -d '{
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

data = {
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": True,
    "log_messages": True,
    "read_incoming_messages": False,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": True,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
}

response = requests.post(url, json=data, headers=headers)
print(response.status_code)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Sample Name",
      phone_number: "Sample Phone_number",
      account_protection: true,
      log_messages: true,
      read_incoming_messages: false,
      webhook_url: "Sample Webhook_url",
      webhook_enabled: true,
      webhook_events: [
        "messages.received",
        "session.status",
        "messages.update"
      ]
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'name' => 'Sample Name',
            'phone_number' => 'Sample Phone_number',
            'account_protection' => true,
            'log_messages' => true,
            'read_incoming_messages' => false,
            'webhook_url' => 'Sample Webhook_url',
            'webhook_enabled' => true,
            'webhook_events' => [
                'messages.received',
                'session.status',
                'messages.update'
            ],
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
request['Content-Type'] = 'application/json'

payload = {
  name: 'Sample Name',
  phone_number: 'Sample Phone_number',
  account_protection: true,
  log_messages: true,
  read_incoming_messages: false,
  webhook_url: 'Sample Webhook_url',
  webhook_enabled: true,
  webhook_events: [
    'messages.received',
    'session.status',
    'messages.update'
  ]
}

request.body = payload.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    // Define payload using a struct or a map (using map for quick editing)
    payload := map[string]interface{}{
        "name":                   "Sample Name",
        "phone_number":           "Sample Phone_number",
        "account_protection":     true,
        "log_messages":           true,
        "read_incoming_messages": false,
        "webhook_url":            "Sample Webhook_url",
        "webhook_enabled":        true,
        "webhook_events": []string{
            "messages.received",
            "session.status",
            "messages.update",
        },
    }

    jsonData, err := json.Marshal(payload)
    if err != nil {
        panic(err)
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""name"": ""Sample Name"",
            ""phone_number"": ""Sample Phone_number"",
            ""account_protection"": true,
            ""log_messages"": true,
            ""read_incoming_messages"": true,
            ""webhook_url"": ""Sample Webhook_url"",
            ""webhook_enabled"": true,
            ""webhook_events"": [
                ""messages.received"",
                ""session.status"",
                ""messages.update""
            ]
        }";

        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{"
            + "\"name\":\"Sample Name\","
            + "\"phone_number\":\"Sample Phone_number\","
            + "\"account_protection\":true,"
            + "\"log_messages\":true,"
            + "\"read_incoming_messages\":true,"
            + "\"webhook_url\":\"Sample Webhook_url\","
            + "\"webhook_enabled\":true,"
            + "\"webhook_events\":["
            +     "\"messages.received\","
            +     "\"session.status\","
            +     "\"messages.update\""
            + "]"
            + "}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
    "Content-Type" = "application/json"
}
$body = @'
{
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN',
        'Content-Type': 'application/json'
      },
      data: {
        name: "Sample Name",
        phone_number: "Sample Phone_number",
        account_protection: true,
        log_messages: true,
        read_incoming_messages: false,
        webhook_url: "Sample Webhook_url",
        webhook_enabled: true,
        webhook_events: [
          "messages.received",
          "session.status",
          "messages.update"
        ]
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "name": "Sample Name",
            "phone_number": "Sample Phone_number",
            "account_protection": true,
            "log_messages": true,
            "read_incoming_messages": false,
            "webhook_url": "Sample Webhook_url",
            "webhook_enabled": true,
            "webhook_events": [
                "messages.received",
                "session.status",
                "messages.update"
            ]
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
  }
}
```
Error Response - Session Limit:
```json
{
    "success": false,
    "error": "You have reached your WhatsApp session limit. Please upgrade your plan to add more sessions."
}
```

### Get WhatsApp Session Details

URL: https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-details
Endpoint: GET /api/whatsapp-sessions/{whatsappSession}
Description: Retrieves details for a specific WhatsApp session.

Details:
Get WhatsApp Session Details

 Retrieves details for a specific WhatsApp session.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Business WhatsApp",
        "phone_number": "+1234567890",
        "status": "connected",
        "account_protection": true,
        "log_messages": true,
        "webhook_url": "https://example.com/webhook",
        "webhook_enabled": true,
        "webhook_events": [
            "message",
            "group_update"
        ],
        "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
        "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
        "created_at": "2025-04-01T12:00:00Z",
        "updated_at": "2025-05-08T15:30:00Z"
    }
}
```

### Update WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/update-whatsapp-session
Endpoint: PUT /api/whatsapp-sessions/{whatsappSession}
Description: Updates details for a specific WhatsApp session. If the session is connected, webhook settings will be synced with the WhatsApp API server.

Details:
Update WhatsApp Session

 Updates details for a specific WhatsApp session. If the session is connected, webhook settings will be synced with the WhatsApp API server.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.
- name (string, optional): Name of the WhatsApp session.
- phone_number (string, optional): Phone number in international format.
- account_protection (boolean, optional): Enable account protection features.
- log_messages (boolean, optional): Enable message logging.
- webhook_url (string, optional): URL for receiving webhook notifications.
- webhook_enabled (boolean, optional): Enable webhook notifications.
- webhook_events (array, optional): Array of events to receive webhook notifications for.
- read_incoming_messages (boolean, optional): Enable the option to automatically mark messages as read when they are received.
- auto_reject_calls (boolean, optional): Enable automatic rejection of incoming calls.
- ignore_groups (boolean, optional): ignore all webhook events from groups.
- ignore_channels (boolean, optional): ignore all webhook events from channels (newsletters).
- ignore_broadcasts (boolean, optional): ignore all webhook events from broadcast lists.
- proxy_url (string, optional): Allowed protocols: http, https, socks5. Use a public domain only (IP addresses and local/private networks are blocked).
- always_online (boolean, optional): When enabled, your session will always appear online to your contacts, even when you're not actively using WhatsApp.

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
  -d '{
      "name": "Sample Name",
      "phone_number": "Sample Phone_number",
      "account_protection": true,
      "log_messages": true,
      "webhook_url": "Sample Webhook_url",
      "webhook_enabled": true,
      "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
      ]
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": True,
    "log_messages": True,
    "read_incoming_messages": True,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": True,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
}
response = requests.put(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}", {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Sample Name",
      phone_number: "Sample Phone_number",
      account_protection: true,
      log_messages: true,
      read_incoming_messages: false,
      webhook_url: "Sample Webhook_url",
      webhook_enabled: true,
      webhook_events: [
        "messages.received",
        "session.status",
        "messages.update"
      ]
    })
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}';

try {
    $response = $client->put($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
          'json' => [
            'name' => 'Sample Name',
            'phone_number' => 'Sample Phone_number',
            'account_protection' => true,
            'log_messages' => true,
            'read_incoming_messages' => false,
            'webhook_url' => 'Sample Webhook_url',
            'webhook_enabled' => true,
            'webhook_events' => [
                'messages.received',
                'session.status',
                'messages.update'
            ],
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Put.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
request['Content-Type'] = 'application/json'

payload = {
  name: 'Sample Name',
  phone_number: 'Sample Phone_number',
  account_protection: true,
  log_messages: true,
  read_incoming_messages: false,
  webhook_url: 'Sample Webhook_url',
  webhook_enabled: true,
  webhook_events: [
    'messages.received',
    'session.status',
    'messages.update'
  ]
}

request.body = payload.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSessions}"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    // Define payload using a struct or a map (using map for quick editing)
    payload := map[string]interface{}{
        "name":                   "Sample Name",
        "phone_number":           "Sample Phone_number",
        "account_protection":     true,
        "log_messages":           true,
        "read_incoming_messages": true,
        "webhook_url":            "Sample Webhook_url",
        "webhook_enabled":        true,
        "webhook_events": []string{
            "messages.received",
            "session.status",
            "messages.update",
        },
    }

    jsonData, err := json.Marshal(payload)
    if err != nil {
        panic(err)
    }

    req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}");
        var request = new RestRequest(Method.PUT);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{
            ""name"": ""Sample Name"",
            ""phone_number"": ""Sample Phone_number"",
            ""account_protection"": true,
            ""log_messages"": true,
            ""read_incoming_messages"": true,
            ""webhook_url"": ""Sample Webhook_url"",
            ""webhook_enabled"": true,
            ""webhook_events"": [
                ""messages.received"",
                ""session.status"",
                ""messages.update""
            ]
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{"
            + "\"name\":\"Sample Name\","
            + "\"phone_number\":\"Sample Phone_number\","
            + "\"account_protection\":true,"
            + "\"log_messages\":true,"
            + "\"read_incoming_messages\":true,"
            + "\"webhook_url\":\"Sample Webhook_url\","
            + "\"webhook_enabled\":true,"
            + "\"webhook_events\":["
            +     "\"messages.received\","
            +     "\"session.status\","
            +     "\"messages.update\""
            + "]"
            + "}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": true,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
    "Content-Type" = "application/json"
}
$body = @'
{
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": true,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'PUT',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN',
        'Content-Type': 'application/json'
      },
       data: {
        name: "Sample Name",
        phone_number: "Sample Phone_number",
        account_protection: true,
        log_messages: true,
        read_incoming_messages: false,
        webhook_url: "Sample Webhook_url",
        webhook_enabled: true,
        webhook_events: [
          "messages.received",
          "session.status",
          "messages.update"
        ]
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.PUT(url)
        .headers(headers)
        .json(&json!({
            "name": "Sample Name",
            "phone_number": "Sample Phone_number",
            "account_protection": true,
            "log_messages": true,
            "read_incoming_messages": true,
            "webhook_url": "Sample Webhook_url",
            "webhook_enabled": true,
            "webhook_events": [
                "messages.received",
                "session.status",
                "messages.update"
            ]
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": true,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
  }
}
```
Success with Warning:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": true,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
    },
    "warning": "WhatsApp session updated but failed to sync webhook settings: Connection error"
}
```

### Delete WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/delete-whatsapp-session
Endpoint: DELETE /api/whatsapp-sessions/{whatsappSession}
Description: Deletes a specific WhatsApp session. If the session is connected, it will attempt to disconnect from the WhatsApp API server first.

Details:
Delete WhatsApp Session

 Deletes a specific WhatsApp session. If the session is connected, it will attempt to disconnect from the WhatsApp API server first.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl -X DELETE "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
response = requests.delete(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}", {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}';

try {
    $response = $client->delete($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Delete.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("DELETE", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}");
        var request = new RestRequest(Method.DELETE);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .method("DELETE", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}")!
var request = URLRequest(url: url)
request.httpMethod = "DELETE"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
$response = Invoke-RestMethod -Uri $uri -Method DELETE -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'DELETE',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.DELETE(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response (204 No content):
```json
{
}
```

### Get WhatsApp Session Status

URL: https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-status
Endpoint: GET /api/status
Description: Returns the current status of the WhatsApp session, including QR and Passkey linking states.

Details:
Get WhatsApp Session Status

 This endpoint returns the current status of a specific WhatsApp session. The session must be previously initialized.

 Session Statuses Explained

 The following statuses may be returned by this endpoint:

 Status
 Meaning
 Recommended action

 connecting
 The session is attempting to establish a connection with WhatsApp servers.
 Wait and check the status again.

 connected
 The session is authenticated and actively connected to WhatsApp.
 You can send and receive messages.

 disconnected
 The session is not currently connected.
 Start the connect flow again using QR or Passkey.

 need_scan
 The session is waiting for the user to scan a WhatsApp QR code.
 Show the QR code to the user or call the QR code endpoint to refresh it.

 need_passkey
 The session is waiting for the user to approve a WhatsApp Passkey linking request.
 Fetch the Passkey token and ask the user to complete approval with Device Link Helper.

 logged_out
 The user logged out of the WhatsApp session manually or from another device.
 Ask the user to reconnect the session using QR or Passkey.

 expired
 The session is no longer valid, often due to inactivity or remote invalidation.
 Reconnect the session.

 Passkey note: When the status is need_passkey, call the Passkey token endpoint and show the temporary token to the user. The user can paste it into the Device Link Helper Chrome extension to finish linking.

 Passkey fallback: If Passkey linking cannot continue, the status may return to need_scan. In that case, show the normal QR linking flow.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/status"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/status"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/status", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/status';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/status')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/status"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/status");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/status"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/status")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/status"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/status',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/status";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Session Connected Response:
```json
{
  "status": "connected"
}
```
Session Needs Passkey Response:
```json
{
  "status": "need_passkey"
}
```
Session Needs Scan Response:
```json
{
  "status": "need_scan"
}
```
Session Logged Out Response:
```json
{
  "status": "logged_out"
}
```
Session Expired Response:
```json
{
  "status": "expired"
}
```
Session Disconnected Response:
```json
{
  "status": "disconnected"
}
```

### Connect WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/connect-whatsapp-session
Endpoint: POST /api/whatsapp-sessions/{whatsappSession}/connect
Description: Initiates the connection process for a WhatsApp session using QR code or Passkey. QR is the default method.

Details:
Connect WhatsApp Session

 Initiates the connection process for a WhatsApp session. Requires an active subscription.

 This endpoint requires an access token in the Authorization header. You can create one from API tokens.

 Linking Methods

 By default, this endpoint starts the normal WhatsApp QR linking flow.

 You can request Passkey linking by sending linkMethod: "passkey". Passkey linking uses the browser extension or desktop helper to approve a WhatsApp passkey prompt.

 Default: If linkMethod is omitted, the API uses qr.

 Fallback: If WhatsApp does not complete the Passkey continuation, the session may return to NEED_SCAN so the user can continue with QR linking.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.
- linkMethod (string, optional): Optional linking method. Use qr or passkey. Defaults to qr.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect" 
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "linkMethod": "passkey"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "linkMethod": "passkey"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```
```javascript
async function connectSession() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      linkMethod: "passkey"
    })
  });

  const result = await response.json();
  console.log(result);
}

connectSession();
```
```php
<?php
require "vendor/autoload.php";

use GuzzleHttpClient;

$client = new Client();

$response = $client->post("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect", [
    "headers" => [
        "Authorization" => "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
        "Content-Type" => "application/json",
        "Accept" => "application/json",
    ],
    "json" => [
        "linkMethod" => "passkey",
    ],
]);

echo $response->getBody();
```
```typescript
import axios from "axios";

async function connectSession() {
  const response = await axios.post(
    "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/connect",
    { linkMethod: "passkey" },
    {
      headers: {
        Authorization: "Bearer YOUR_PERSONAL_ACCESS_TOKEN",
        "Content-Type": "application/json"
      }
    }
  );

  console.log(response.data);
}

connectSession();
```

Response examples:
Success Response - QR Code Needed:
```json
{
  "success": true,
  "data": {
    "status": "NEED_SCAN",
    "qrCode": "2@DTMUHeYfa9/RMXr8A2IP3/..."
  }
}
```
Success Response - Passkey Needed:
```json
{
  "success": true,
  "data": {
    "status": "NEED_PASSKEY",
    "passkey": {
      "token": "temporary-passkey-token",
      "expires_at": "2026-07-09T12:30:00Z"
    }
  }
}
```
Success Response - Already Connected:
```json
{
  "success": true,
  "data": {
    "status": "CONNECTED",
    "message": "Session already initialized or connecting. No QR code needed."
  }
}
```
Error Response - No Subscription:
```json
{
  "success": false,
  "error": "You need to have an active subscription to connect a WhatsApp session."
}
```

### Restart WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/restart-whatsapp-session
Endpoint: POST /api/whatsapp-sessions/{whatsappSession}/restart
Description: Restarts a specific, currently connected WhatsApp session.

Details:
Restart WhatsApp Session

 This endpoint initiates a soft restart of the WhatsApp session connection. It is useful for refreshing the connection to the server without needing to re-scan a QR code.

 The session must be in a connected state for the restart to be successful. If the session is disconnected or in another state, the request will fail.

Parameters:
- whatsappSession (integer, required): The unique identifier of the WhatsApp session to restart.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart" 
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart"
headers = {"Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"}

response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$sessionId = 'whatsapp-sessions/my-session-123';
$url = 'https://www.wasenderapi.com/api/' . $sessionId . '/restart';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("POST", url, nil) // No body
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'post',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/restart";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "message": "WhatsApp session restarted successfully."
}
```
Error Response (Not Connected):
```json
{
    "success": false,
    "error": "WhatsApp session is not connected. Cannot restart."
}
```

### Get Message Logs

URL: https://wasenderapi.com/api-docs/sessions/get-message-logs
Endpoint: GET /api/whatsapp-sessions/{whatsappSession}/message-logs
Description: Retrieves a paginated list of message logs for a specific session.

Details:
Get Message Logs

 This endpoint fetches a paginated history of messages sent using our API by the specified WhatsApp session. It is useful for auditing, analytics, or displaying message history in an application.

 Important: Message logging must be enabled for each session individually in your settings. If logging is disabled, the content and the to field will benull.

 The response is structured as a standard paginated object, which you can navigate using the optional page and per_page query parameters.

Parameters:
- whatsappSession (string, required): The unique identifier of the WhatsApp session.
- page (integer, optional): The page number to retrieve. Defaults to 1.
- per_page (integer, optional): The number of items to retrieve per page. Defaults to 10.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs?page=1&per_page=20" 
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
params = {
    "page": 1,
    "per_page": 20
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```
```javascript
async function callApi() {
  const url = new URL("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs");
  url.searchParams.append('page', '1');
  url.searchParams.append('per_page', '20');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$sessionId = 'whatsapp-sessions/my-session-123';
$url = 'https://www.wasenderapi.com/api/' . $sessionId . '/message-logs';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ],
        'query' => [
            'page' => 1,
            'per_page' => 20
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs')
uri.query = URI.encode_www_form({ page: 1, per_page: 20 })

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    baseUrl := "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", baseUrl, nil)
    if err != nil {
        panic(err)
    }

    q := req.URL.Query()
    q.Add("page", "1")
    q.Add("per_page", "20")
    req.URL.RawQuery = q.Encode()

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs?page=1&per_page=20");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs?page=1&per_page=20"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

var components = URLComponents(string: "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs")!
components.queryItems = [
    URLQueryItem(name: "page", value: "1"),
    URLQueryItem(name: "per_page", value: "20")
]

let url = components.url!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs"
$params = @{ page = 1; per_page = 20 }
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers -Body $params
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'get',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      params: {
        page: 1,
        per_page: 20
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/message-logs";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.get(url)
        .headers(headers)
        .query(&[("page", 1), ("per_page", 20)])
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response (Paginated):
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": "1001",
                "whatsapp_session_id": "501",
                "to": "+155501001234",
                "content": "{\"text\":\"This is a sample message. Lorem ipsum dolor sit amet, consectetur adipiscing elit.\"}",
                "status": "sent",
                "failed_reason": null,
                "created_at": "2023-10-27 10:30:15",
                "updated_at": "2023-10-27 10:30:17"
            },
            {
                "id": "1002",
                "whatsapp_session_id": "502",
                "to": "+4455501005678",
                "content": "{\"text\":\"Hello! This is an example message sent to a user. How can we help you today?\"}",
                "status": "in_progress",
                "failed_reason": null,
                "created_at": "2023-10-27 10:32:45",
                "updated_at": "2023-10-27 10:32:48"
            },
            {
                "id": "1003",
                "whatsapp_session_id": "503",
                "to": "+5255501009876",
                "content": "{\"text\":\"Just a test message to verify the connection.\"}",
                "status": "failed",
                "failed_reason": "invalid WhatsApp number",
                "created_at": "2023-10-27 10:35:01",
                "updated_at": "2023-10-27 10:35:03"
            }
        ],
        "first_page_url": "/api/session-id-123/message-logs?page=1",
        "from": 1,
        "last_page": 5,
        "last_page_url": "/api/session-id-123/message-logs?page=5",
        "next_page_url": "/api/session-id-123/message-logs?page=2",
        "path": "/api/session-id-123/message-logs",
        "per_page": 3,
        "prev_page_url": null,
        "to": 3,
        "total": 15
    }
}
```

### Get Passkey Token

URL: https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-passkey-token
Endpoint: GET /api/whatsapp-sessions/{whatsappSession}/passkey-token
Description: Retrieves the temporary Passkey token and explains the recommended API flow using the Device Link Helper Chrome extension.

Details:
Get Passkey Token

 Retrieves the temporary Passkey token for a session in NEED_PASSKEY status.

 Recommended API flow

 Use this flow when your application starts Passkey linking through the API and you want the user to complete the approval with the Device Link Helper Chrome extension.

 - Call POST /api/whatsapp-sessions/{whatsappSession}/connect with {"linkMethod":"passkey"}.

 - Read the temporary token from data.passkey.token. If the session is already waiting for Passkey approval, call this endpoint to fetch the latest token.

 - Show the token to the user inside your application.

 - Ask the user to open the Device Link Helper Chrome extension.

 - The user pastes the token into the extension and clicks Open WhatsApp Passkey.

 - The extension opens WhatsApp Web, asks the user to approve the Passkey prompt, and completes linking through WasenderAPI.

 Install Device Link Helper from the Chrome Web Store

 The token is temporary and expires quickly. If it expires, call this endpoint again or restart the Passkey linking flow.

 Example user instructions

 1. Install and open the Device Link Helper Chrome extension.
2. Paste this Passkey token:
 TEMPORARY_PASSKEY_TOKEN
3. Click Open WhatsApp Passkey.
4. Approve the WhatsApp Passkey prompt.
5. If WhatsApp asks on your phone, tap Continue only if you started this request.

 Custom helper flow

 If you do not want to use Device Link Helper, you can build your own helper using the advanced Passkey endpoints below. Your helper must run navigator.credentials.get() from https://web.whatsapp.com; credentials created from your own application origin or a normal extension origin will be rejected by WhatsApp.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/passkey-token" 
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```
```javascript
const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/passkey-token", {
  headers: {
    Authorization: "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  }
});

const result = await response.json();
console.log(result);
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "token": "temporary-passkey-token",
    "expires_at": "2026-07-09T12:30:00Z"
  }
}
```

### Get WhatsApp Session QR Code

URL: https://wasenderapi.com/api-docs/sessions/get-whatsapp-session-qr-code
Endpoint: GET /api/whatsapp-sessions/{whatsappSession}/qrcode
Description: Retrieves the QR code needed to connect a WhatsApp session with the WhatsApp client. Requires an active subscription.

Details:
Get WhatsApp Session QR Code

 Retrieves the QR code needed to connect a WhatsApp session with the WhatsApp client. Requires an active subscription.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from
 here.

 Important: Before calling this endpoint, you must first initialize the WhatsApp session by calling the
 Connect WhatsApp Session endpoint.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/qrcode";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "qrCode": "2@DfzdTHeYfa9/RMXr8A2IP3/....", // This is the QR string. Use a QR code library to generate an image.
    }
}
```
Error Response - No Subscription:
```json
{
    "success": false,
    "error": "You need to have an active subscription to connect a WhatsApp session."
}
```
Error Response - QR Code Failure:
```json
{
    "success": false,
    "error": "Failed to get QR code. please re initialize the session."
}
```
Error Response - Session Not initialized:
```json
{
    "success": false,
    "error": "QR code scan requested for a session that is not in NEED_SCAN state. Please call the connect endpoint first to initialize the session."
}
```

### Disconnect WhatsApp Session

URL: https://wasenderapi.com/api-docs/sessions/disconnect-whatsapp-session
Endpoint: POST /api/whatsapp-sessions/{whatsappSession}/disconnect
Description: Disconnects an active WhatsApp session.

Details:
Disconnect WhatsApp Session

 Disconnects an active WhatsApp session.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
headers = {
    "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_PERSONAL_ACCESS_TOKEN';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
    apiKey := "YOUR_PERSONAL_ACCESS_TOKEN"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"))
            .header("Authorization", "Bearer YOUR_PERSONAL_ACCESS_TOKEN")
            .method("POST", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_PERSONAL_ACCESS_TOKEN", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
$headers = @{
    "Authorization" = "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
}
$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect',
      headers: {
        'Authorization': 'Bearer YOUR_PERSONAL_ACCESS_TOKEN'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect";
    let api_key = "YOUR_PERSONAL_ACCESS_TOKEN";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "status": "disconnected",
        "message": "WhatsApp session disconnected successfully"
    }
}
```

### Get Pending Passkey Request

URL: https://wasenderapi.com/api-docs/sessions/get-pending-passkey-request
Endpoint: GET /api/passkey/pending
Description: Advanced helper endpoint used to fetch WhatsApp WebAuthn publicKey options and inspect the current Passkey request status.

Details:
Get Pending Passkey Request

 This endpoint is part of the advanced Passkey helper flow.

 Recommended API flow: Most API integrations should not call this endpoint directly. Start Passkey linking through the session connect endpoint, show the returned temporary token to the user, and ask the user to paste it into the Device Link Helper Chrome extension.

 Install Device Link Helper

 If you are building your own helper, call this endpoint with the temporary Passkey token. It returns the WebAuthn publicKey options that must be passed to navigator.credentials.get().

 Status values

 The status field tells your helper what stage the Passkey linking request is in.

 Status
 Meaning
 What your helper should do

 pending
 The Passkey request was created and is waiting for a WebAuthn credential.
 Call navigator.credentials.get() with the returned publicKey, then submit the credential to /api/passkey/response.

 prologue_sent
 The credential was accepted by the API service and the Passkey prologue was sent to WhatsApp.
 Keep polling this endpoint until the request becomes ready for confirmation, succeeds, fails, or times out.

 confirmation
 WhatsApp returned the continuation data and the request is ready to be confirmed.
 Call /api/passkey/confirm with the same token and requestId.

 confirmed
 The Passkey linking request was confirmed successfully.
 Stop polling and check the session status. It should move toward CONNECTED.

 fallback_qr
 The proactive Passkey flow did not complete and the session returned to QR linking.
 Stop the Passkey helper flow and show the QR linking UI instead.

 no_continuation
 WhatsApp accepted the Passkey prologue but did not send the continuation needed to finish linking.
 Stop polling. Ask the user to retry Passkey linking or use QR linking.

 expired
 The temporary Passkey token expired before linking completed.
 Request a fresh Passkey token or restart the Passkey linking flow.

 error
 The request failed.
 Show the returned error message and allow the user to retry or use QR linking.

 Your custom helper must run the WebAuthn request from the correct WhatsApp Web origin, https://web.whatsapp.com. Calling WebAuthn from your own application origin or a normal extension origin will produce a credential WhatsApp rejects.

Parameters:
- token (string, required): Temporary Passkey token generated for the session.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/passkey/pending?token=TEMPORARY_PASSKEY_TOKEN"
```
```javascript
const response = await fetch("https://www.wasenderapi.com/api/passkey/pending?token=TEMPORARY_PASSKEY_TOKEN");
const result = await response.json();
console.log(result);
```

Response examples:
Success Response:
```json
{
  "success": true,
  "requestId": "passkey-request-id",
  "publicKey": {
    "challenge": "base64url-challenge",
    "rpId": "whatsapp.com",
    "userVerification": "preferred"
  },
  "status": "pending"
}
```

### Get Session Logs

URL: https://wasenderapi.com/api-docs/sessions/get-session-logs
Endpoint: GET /api/whatsapp-sessions/{whatsappSession}/session-logs
Description: Retrieves a paginated list of session activity logs.

Details:
Get Session Logs

 This endpoint fetches a paginated history of significant events for the specified WhatsApp session. These logs are crucial for debugging connection issues, tracking the session's lifecycle (e.g., when it connected, disconnected, or received a QR code), and general auditing.

 The response is a standard paginated object, which you can navigate using the page and per_page query parameters.

Parameters:
- whatsappSession (integer, required): The unique identifier of the WhatsApp session.
- page (integer, optional): The page number to retrieve. Defaults to 1.
- per_page (integer, optional): The number of items to retrieve per page. Defaults to 10.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs?page=1&per_page=15" 
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
params = {
    "page": 1,
    "per_page": 15
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```
```javascript
async function callApi() {
  const url = new URL("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs");
  url.searchParams.append('page', '1');
  url.searchParams.append('per_page', '15');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$sessionId = 'whatsapp-sessions/my-session-123';
$url = 'https://www.wasenderapi.com/api/' . $sessionId . '/session-logs';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ],
        'query' => [
            'page' => 1,
            'per_page' => 15
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs')
uri.query = URI.encode_www_form({ page: 1, per_page: 15 })

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    baseUrl := "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", baseUrl, nil)
    if err != nil {
        panic(err)
    }

    q := req.URL.Query()
    q.Add("page", "1")
    q.Add("per_page", "15")
    req.URL.RawQuery = q.Encode()

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs?page=1&per_page=15");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs?page=1&per_page=15"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

var components = URLComponents(string: "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs")!
components.queryItems = [
    URLQueryItem(name: "page", value: "1"),
    URLQueryItem(name: "per_page", value: "15")
]

let url = components.url!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs"
$params = @{ page = 1; per_page = 15 }
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers -Body $params
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'get',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      params: {
        page: 1,
        per_page: 15
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/my-session-123/session-logs";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap.new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.get(url)
        .headers(headers)
        .query(&[("page", 1), ("per_page", 15)])
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response (Paginated):
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 201,
                "whatsapp_session_id": 1,
                "event_type": "session_restarted",
                "status":"connected",
                "occurred_at": "2025-09-23T12:00:00.000000Z"
            },
            {
                "id": 200,
                "whatsapp_session_id": 1,
                "event_type": "status_change",
                "status": "need_scan",
                "occurred_at": "2025-09-23T11:59:30.000000Z"
            }
        ],
        "first_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=1",
        "from": 1,
        "last_page": 3,
        "last_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=3",
        "next_page_url": "/api/whatsapp-sessions/my-session-123/session-logs?page=2",
        "path": "/api/whatsapp-sessions/my-session-123/session-logs",
        "per_page": 2,
        "prev_page_url": null,
        "to": 2,
        "total": 6
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "The specified session was not found."
}
```

### Get Session User Info

URL: https://wasenderapi.com/api-docs/sessions/get-session-user-info
Endpoint: GET /api/user
Description: Retrieves information about the WhatsApp user associated with the current API key session.

Details:
Get Session User Info

 Retrieves information about the WhatsApp user associated with the current API key session.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/user"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/user"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/user", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/user';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/user')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/user"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/user");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/user"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/user")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/user"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/user',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/user";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
     "id": "1234567890:42@s.whatsapp.net",
     "name": "Your WhatsApp Name",
     "lid": "Your LID"
  }
}
```

### Submit Passkey Response

URL: https://wasenderapi.com/api-docs/sessions/submit-passkey-response
Endpoint: POST /api/passkey/response
Description: Advanced helper endpoint used to submit a WebAuthn credential response. Most API integrations should use the Device Link Helper manual token flow instead.

Details:
Submit Passkey Response

 This endpoint is part of the advanced Passkey helper flow.

 Recommended API flow: Most API integrations should not call this endpoint directly. Use Device Link Helper instead: show the temporary Passkey token to the user, and the user pastes it into the extension. The extension opens WhatsApp Web, asks for Passkey approval, serializes the credential, and submits it automatically.

 Install Device Link Helper

 If you are building your own helper, submit the serialized WebAuthn credential returned by navigator.credentials.get() to this endpoint.

 The credential must be created from https://web.whatsapp.com. If the credential origin is your application domain or a normal extension origin, WhatsApp will reject it.

Parameters:
- token (string, required): Temporary Passkey token.
- requestId (string, required): Pending Passkey request ID.
- credential (object, required): Serialized WebAuthn credential response.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/passkey/response" 
  -H "Content-Type: application/json" 
  -d '{
    "token": "TEMPORARY_PASSKEY_TOKEN",
    "requestId": "passkey-request-id",
    "credential": {
      "id": "credential-id",
      "rawId": "base64url-raw-id",
      "type": "public-key",
      "response": {
        "clientDataJSON": "base64url-client-data",
        "authenticatorData": "base64url-authenticator-data",
        "signature": "base64url-signature",
        "userHandle": null
      }
    }
  }'
```
```javascript
const response = await fetch("https://www.wasenderapi.com/api/passkey/response", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    token: "TEMPORARY_PASSKEY_TOKEN",
    requestId: "passkey-request-id",
    credential
  })
});

const result = await response.json();
console.log(result);
```

Response examples:
Accepted Response:
```json
{
  "success": true,
  "status": "prologue_sent"
}
```

### Check if a number is on WhatsApp

URL: https://wasenderapi.com/api-docs/sessions/check-if-a-number-is-on-whatsapp
Endpoint: GET /api/on-whatsapp/{phone_number}
Description: Verifies if a given Phone Number is registered on WhatsApp.

Details:
Check if a number is on WhatsApp

 Verifies if a given Phone Number is registered on WhatsApp.

Parameters:
- phone_number (string, required): The Phone Number of the user to check, e.g., +1234567890

Code examples:
```bash
curl "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/on-whatsapp/{phone_number}", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/on-whatsapp/{phone_number}';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/on-whatsapp/{phone_number}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/on-whatsapp/{phone_number}");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/on-whatsapp/{phone_number}',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/on-whatsapp/{phone_number}";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
      "success": true,
      "data": {
        "exists": true,
}
```

### Confirm Passkey Link

URL: https://wasenderapi.com/api-docs/sessions/confirm-passkey-link
Endpoint: POST /api/passkey/confirm
Description: Advanced helper endpoint used to confirm a Passkey linking request. Most API integrations should use the Device Link Helper manual token flow instead.

Details:
Confirm Passkey Link

 This endpoint is part of the advanced Passkey helper flow.

 Recommended API flow: Most API integrations should not call this endpoint directly. Use Device Link Helper instead: show the temporary Passkey token to the user, and the extension will handle confirmation automatically after the user approves the Passkey prompt.

 Install Device Link Helper

 If you are building your own helper, call this endpoint after submitting the Passkey response and after the pending request reports that confirmation is available.

Parameters:
- token (string, required): Temporary Passkey token.
- requestId (string, required): Pending Passkey request ID.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/passkey/confirm" 
  -H "Content-Type: application/json" 
  -d '{
    "token": "TEMPORARY_PASSKEY_TOKEN",
    "requestId": "passkey-request-id"
  }'
```
```javascript
const response = await fetch("https://www.wasenderapi.com/api/passkey/confirm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    token: "TEMPORARY_PASSKEY_TOKEN",
    requestId: "passkey-request-id"
  })
});

const result = await response.json();
console.log(result);
```

Response examples:
Success Response:
```json
{
  "success": true,
  "status": "confirmed"
}
```

### Regenerate API Key

URL: https://wasenderapi.com/api-docs/sessions/regenerate-api-key
Endpoint: POST /api/whatsapp-sessions/{whatsappSession}/regenerate-key
Description: Regenerates the API key for a specific WhatsApp session.

Details:
Regenerate API Key

 Regenerates the API key for a specific WhatsApp session.

 This endpoint requires an access token to be included in the Authorization header.
 You can get the token from here.

Parameters:
- whatsappSession (integer, required): ID of the WhatsApp session.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/whatsapp-sessionsv
/{whatsappSession}/regenerate-key"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("POST", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/whatsapp-sessionsv
/{whatsappSession}/regenerate-key")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "api_key": "new_whatsapp_api_key_abc456"
}
```

### Send Presence Update

URL: https://wasenderapi.com/api-docs/sessions/send-presence-update
Endpoint: POST /api/send-presence-update
Description: Sends a presence update to a specific JID (e.g., 'typing...' or 'recording...') to indicate user activity. This requires an active session.

Details:
Send Presence Update

 Sends a presence update to a specific JID (e.g., typing... or recording...)
 to indicate user activity. This requires an active session.

 Supported Types

 - composing – Indicates the user is typing.

 - recording – Indicates the user is recording a voice message.

 - available – Marks the user as online/active.

 - unavailable – Marks the user as offline/inactive.

 Rules

 -
 When using composing or recording, the presence
 must be sent to the contact’s JID (the person you are chatting with).

 -
 When using available or unavailable, the presence
 must be sent with your own number as the JID.

Parameters:
- jid (string, required): WhatsApp JID of the recipient (e.g., `1234567890@s.whatsapp.net`).
- type (string, required): The presence state to send. Must be one of: composing, recording, available, or unavailable.
- delayMs (integer, optional): Optional duration in milliseconds to show the presence update.

Code examples:
```bash
curl -X POST \
  "https://www.wasenderapi.com/api/send-presence-update" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "type": "composing"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-presence-update"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "jid": "1234567890@s.whatsapp.net",
    "type": "composing"
}

response = requests.post(url, json=data, headers=headers)
print(response.status_code)
print(response.json())
```
```javascript
async function sendPresenceUpdate() {
  const response = await fetch("https://www.wasenderapi.com/api/send-presence-update", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jid: "1234567890@s.whatsapp.net",
      type: "composing"
    })
  });

  const result = await response.json();
  console.log(result);
}

sendPresenceUpdate();
```
```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-presence-update';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'jid' => '1234567890@s.whatsapp.net',
            'type' => 'composing',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-presence-update')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

payload = {
  jid: '1234567890@s.whatsapp.net',
  type: 'composing'
}

request.body = payload.to_json
response = http.request(request)
puts JSON.parse(response.body)
```
```Go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-presence-update"
    apiKey := "YOUR_API_KEY"

    payload := map[string]interface{}{
        "jid":  "1234567890@s.whatsapp.net",
        "type": "composing",
    }

    jsonData, err := json.Marshal(payload)
    if err != nil {
        panic(err)
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```C#
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-presence-update");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""jid"": ""1234567890@s.whatsapp.net"",
            ""type"": ""composing""
        }";

        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String json = "{"
            + "\"jid\":\"1234567890@s.whatsapp.net\","
            + "\"type\":\"composing\""
            + "}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-presence-update"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-presence-update")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "jid": "1234567890@s.whatsapp.net",
    "type": "composing"
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }
    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }
    print(jsonString)
}

task.resume()
```
```poweshell
$uri = "https://www.wasenderapi.com/api/send-presence-update"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$body = @{
    "jid" = "1234567890@s.whatsapp.net"
    "type" = "composing"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function sendPresenceUpdate() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-presence-update',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        jid: "1234567890@s.whatsapp.net",
        type: "composing"
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendPresenceUpdate();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-presence-update";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "jid": "1234567890@s.whatsapp.net",
            "type": "composing"
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "jid": "123456789@whatsapp.net",
    "type": "composing"
  }
}
```
Error Response - Invalid JID:
```json
{
 "success": false,
 "error": "Error sending presence update: Invalid JID provided."
}
```

### Block Contact

URL: https://wasenderapi.com/api-docs/contacts/block-contact
Endpoint: POST /api/contacts/{contactPhoneNumber}/block
Description: Blocks a specific contact.

Details:
Block Contact

 Blocks a specific contact.

Parameters:
- contactPhoneNumber (string, required): The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("POST", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/block";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "message": "Contact blocked"
    }
}
```

### Get All Contacts

URL: https://wasenderapi.com/api-docs/contacts/get-all-contacts
Endpoint: GET /api/contacts
Description: Retrieves a list of all contacts synced with the WhatsApp session.

Details:
Get All Contacts

 Retrieves a list of all contacts synced with the WhatsApp session.

 Query Parameters

 - paginated (boolean, optional) — When true, returns data.items and data.pagination. Default: false.

 - page (integer, optional) — Page number (only used when paginated=true). Default: 1.

 - limit (integer, optional) — Items per page (only used when paginated=true). Default: 20.

Parameters:
- paginated (boolean, optional): When true, returns a paginated response with data.items and data.pagination. When false, returns a simple array of contacts in data.
- page (integer, optional): Page number (only used when paginated=true).
- limit (integer, optional): Items per page (only used when paginated=true).

Code examples:
```bash
curl "https://www.wasenderapi.com/api/contacts?paginated=true&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/contacts',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response (non-paginated):
```json
{
  "success": true,
  "data": [
    {
      "jid": "1234567890",
      "name": "Contact Name",
      "notify": "Contact Display Name",
      "verifiedName": "Verified Business Name",
      "imgUrl": "https:\/\/profile.pic.url\/image.jpg",
      "status": "Hey there! I am using WhatsApp."
    }
  ]
}
```
Success Response (paginated=true):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "jid": "1234567890",
        "name": "Contact Name",
        "notify": "Contact Display Name",
        "verifiedName": "Verified Business Name",
        "imgUrl": "https:\/\/profile.pic.url\/image.jpg",
        "status": "Hey there! I am using WhatsApp."
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### Get Contact Info

URL: https://wasenderapi.com/api-docs/contacts/get-contact-info
Endpoint: GET /api/contacts/{contactPhoneNumber}
Description: Retrieves detailed information for a specific contact.

Details:
Get Contact Info

 Retrieves detailed information for a specific contact.

Parameters:
- contactPhoneNumber (string, required): The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "id": "1234567890@placeholder.net",
    "name": "Contact Name",
    "notify": "Notification Name",
    "verifiedName": null,
    "imgUrl": null,
    "status": null
  }
}
```

### Get Contact Profile Picture

URL: https://wasenderapi.com/api-docs/contacts/get-contact-profile-picture
Endpoint: GET /api/contacts/{contactPhoneNumber}/picture
Description: Retrieves the URL of the profile picture for a specific contact.

Details:
Get Contact Profile Picture

 Retrieves the URL of the profile picture for a specific contact.

Parameters:
- contactPhoneNumber (string, required): The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/picture";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "imgUrl": "https:\/\/profile.pic.url\/image.jpg"
    }
}
```

### Unblock Contact

URL: https://wasenderapi.com/api-docs/contacts/unblock-contact
Endpoint: POST /api/contacts/{contactPhoneNumber}/unblock
Description: Unblocks a specific contact.

Details:
Unblock Contact

 Unblocks a specific contact.

Parameters:
- contactPhoneNumber (string, required): The JID (Jabber ID) of the contact in E.164 format (international phone number) e.g., 1234567890.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("POST", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts/{contactPhoneNumber}/unblock";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "message": "Contact unblocked"
    }
}
```

### Create or Update Contact

URL: https://wasenderapi.com/api-docs/contacts/create-or-update-contact
Endpoint: PUT /api/contacts
Description: Creates or updates a contact in the session's address book.

Details:
Create or Update Contact

 This endpoint allows you to manage contacts associated with the WhatsApp session. If you provide a jid that does not exist in the session's contacts, a new contact will be created with the provided fullName. If the jid already exists, its name will be updated.

 The optional saveOnPrimaryAddressbook parameter can be used to sync the contact to the primary address book of the device running WhatsApp, though this behavior may vary by platform.

Parameters:
- jid (string, required): The JID of the contact to create or update (e.g., 1234567890@s.whatsapp.net).
- fullName (string, optional): The full name to assign to the contact.
- saveOnPrimaryAddressbook (boolean, optional): If set to true, it attempts to save the contact on the device's primary address book. Defaults to false.

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/contacts" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "jid": "1234567890@s.whatsapp.net",
    "fullName": "John Doe",
    "saveOnPrimaryAddressbook": true
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/contacts"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "jid": "1234567890@s.whatsapp.net",
    "fullName": "John Doe",
    "saveOnPrimaryAddressbook": True
}

response = requests.put(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/contacts", {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "jid": "1234567890@s.whatsapp.net",
      "fullName": "John Doe",
      "saveOnPrimaryAddressbook": true
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/contacts';

try {
    $response = $client->put($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'jid' => '1234567890@s.whatsapp.net',
            'fullName' => 'John Doe',
            'saveOnPrimaryAddressbook' => true
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/contacts')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Put.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  jid: "1234567890@s.whatsapp.net",
  fullName: "John Doe",
  saveOnPrimaryAddressbook: true
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/contacts"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "jid": "1234567890@s.whatsapp.net",
        "fullName": "John Doe",
        "saveOnPrimaryAddressbook": true,
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("PUT", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/contacts");
        var request = new RestRequest(Method.PUT);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""jid"": ""1234567890@s.whatsapp.net"",
            ""fullName"": ""John Doe"",
            ""saveOnPrimaryAddressbook"": true
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "jid": "1234567890@s.whatsapp.net",
                "fullName": "John Doe",
                "saveOnPrimaryAddressbook": true
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/contacts"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/contacts")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "jid": "1234567890@s.whatsapp.net",
    "fullName": "John Doe",
    "saveOnPrimaryAddressbook": true
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/contacts"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "jid": "1234567890@s.whatsapp.net",
    "fullName": "John Doe",
    "saveOnPrimaryAddressbook": $true
}
'@

$response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'PUT',
      url: 'https://www.wasenderapi.com/api/contacts',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "jid": "1234567890@s.whatsapp.net",
        "fullName": "John Doe",
        "saveOnPrimaryAddressbook": true
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/contacts";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.put(url)
        .headers(headers)
        .json(&json!({
            "jid": "1234567890@s.whatsapp.net",
            "fullName": "John Doe",
            "saveOnPrimaryAddressbook": true
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "jid": "1234567890@s.whatsapp.net",
        "fullName": "John Doe"
    }
}
```
Error Response (Validation):
```json
{
    "success": false,
    "error": "The jid field is required."
}
```

### Get LID from Phone Number

URL: https://wasenderapi.com/api-docs/contacts/get-lid-from-phone-number
Endpoint: GET /api/lid-from-pn/{pn}
Description: Retrieves the Link ID (LID) associated with a real phone number (PN).

Details:
Get LID from Phone Number

 This endpoint performs the reverse operation of the previous one. Given a user's full phone number JID (ending in @s.whatsapp.net), it retrieves their corresponding Link ID (LID).

Parameters:
- pn (string, required): The phone number JID of the user, which must end with @s.whatsapp.net.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net" 
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$pn = '1234567890@s.whatsapp.net';
$url = 'https://www.wasenderapi.com/api/lid-from-pn/' . $pn;

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net"
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'get',
      url: 'https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/lid-from-pn/1234567890@s.whatsapp.net";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.get(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "lid": "1234567890@lid"
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "Phone number not found or invalid."
}
```

### Get Phone Number from LID

URL: https://wasenderapi.com/api-docs/contacts/get-phone-number-from-lid
Endpoint: GET /api/pn-from-lid/{lid}
Description: Retrieves the real phone number (PN) associated with a Link ID (LID).

Details:
Get Phone Number from LID

 WhatsApp uses a privacy feature called Link ID (LID) which can sometimes mask a user's real phone number. This endpoint allows you to resolve a LID back to its corresponding full phone number JID (ending in @s.whatsapp.net).

 This is useful when you have a LID from an interaction (like a group message) and need to identify the user by their actual phone number.

Parameters:
- lid (string, required): The Link ID (LID) of the user, which must end with @lid.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid" 
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$lid = '1234567890@lid';
$url = 'https://www.wasenderapi.com/api/pn-from-lid/' . $lid;

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid"
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'get',
      url: 'https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/pn-from-lid/1234567890@lid";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap.new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.get(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "pn": "1234567890@s.whatsapp.net"
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "LID not found or invalid."
}
```

### Decrypt Media File

URL: https://wasenderapi.com/api-docs/messages/decrypt-media-file
Endpoint: POST /api/decrypt-media
Description: This endpoint is used to decrypt media files sent in messages. You need to provide the encrypted media information, including the mediaKey and the url where the encrypted file is hosted. The API will then decrypt the file and store it temporarily, returning a publicUrl from which the decrypted file can be downloaded. This public URL will be active for one hour.

Details:
Decrypt Media File

 POST
 /api/decrypt-media

 This endpoint decrypts an encrypted media file (image, video, audio, document, or sticker). You provide the encrypted media information, and the API returns a temporary public URL to access the decrypted file. This URL is valid for one hour.

 Request Body

 The request body must be a JSON object containing the message data. The structure is as follows:

 {
 "data": {
 "messages": {
 "key": {
 "id": "YOUR_UNIQUE_MESSAGE_ID"
 },
 "message": {
 "imageMessage": {
 "url": "URL_OF_ENCRYPTED_IMAGE",
 "mimetype": "image/jpeg",
 "mediaKey": "YOUR_MEDIA_KEY",
 "fileSha256": "FILE_SHA256_HASH",
 "fileLength": "FILE_SIZE_IN_BYTES",
 "fileName": "example.jpg"
 }
 }
 }
 }
}

 Note: The message object can contain imageMessage, videoMessage, audioMessage, documentMessage, or stickerMessage.

Parameters:
- data (object, required): Note: The message object must contain imageMessage, videoMessage, audioMessage, documentMessage, or stickerMessage, depending on the type of media you are decrypting.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/decrypt-media" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "messages": {
        "key": {
          "id": "YOUR_UNIQUE_MESSAGE_ID"
        },
        "message": {
          "imageMessage": {
            "url": "URL_OF_ENCRYPTED_IMAGE",
            "mimetype": "image/jpeg",
            "mediaKey": "YOUR_MEDIA_KEY"
          }
        }
      }
    }
  }'
```
```python
import requests
import json

url = "https://www.wasenderapi.com/api/decrypt-media"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "data": {
        "messages": {
            "key": {
                "id": "YOUR_UNIQUE_MESSAGE_ID"
            },
            "message": {
                "imageMessage": {
                    "url": "URL_OF_ENCRYPTED_IMAGE",
                    "mimetype": "image/jpeg",
                    "mediaKey": "YOUR_MEDIA_KEY"
                }
            }
        }
    }
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())
```
```javascript
async function callApi() {
  const payload = {
    data: {
      messages: {
        key: {
          id: "YOUR_UNIQUE_MESSAGE_ID"
        },
        message: {
          imageMessage: {
            url: "URL_OF_ENCRYPTED_IMAGE",
            mimetype: "image/jpeg",
            mediaKey: "YOUR_MEDIA_KEY"
          }
        }
      }
    }
  };

  const response = await fetch("https://www.wasenderapi.com/api/decrypt-media", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/decrypt-media';

$payload = [
    'data' => [
        'messages' => [
            'key' => [
                'id' => 'YOUR_UNIQUE_MESSAGE_ID'
            ],
            'message' => [
                'imageMessage' => [
                    'url' => 'URL_OF_ENCRYPTED_IMAGE',
                    'mimetype' => 'image/jpeg',
                    'mediaKey' => 'YOUR_MEDIA_KEY'
                ]
            ]
        ]
    ]
];

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ],
        'json' => $payload
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/decrypt-media')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

payload = {
  data: {
    messages: {
      key: { id: 'YOUR_UNIQUE_MESSAGE_ID' },
      message: {
        imageMessage: {
          url: 'URL_OF_ENCRYPTED_IMAGE',
          mimetype: 'image/jpeg',
          mediaKey: 'YOUR_MEDIA_KEY'
        }
      }
    }
  }
}
request.body = payload.to_json

response = http.request(request)

puts "Status Code: #{response.code}"
puts "Response Body: #{JSON.parse(response.body)}"
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/decrypt-media"
    apiKey := "YOUR_API_KEY"

    payload := map[string]interface{}{
        "data": map[string]interface{}{
            "messages": map[string]interface{}{
                "key": map[string]interface{}{
                    "id": "YOUR_UNIQUE_MESSAGE_ID",
                },
                "message": map[string]interface{}{
                    "imageMessage": map[string]interface{}{
                        "url":      "URL_OF_ENCRYPTED_IMAGE",
                        "mimetype": "image/jpeg",
                        "mediaKey": "YOUR_MEDIA_KEY",
                    },
                },
            },
        },
    }
    jsonPayload, _ := json.Marshal(payload)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/decrypt-media");
        var request = new RestRequest(Method.POST);

        // Add headers
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        // Create payload
        var payload = new {
            data = new {
                messages = new {
                    key = new { id = "YOUR_UNIQUE_MESSAGE_ID" },
                    message = new {
                        imageMessage = new {
                            url = "URL_OF_ENCRYPTED_IMAGE",
                            mimetype = "image/jpeg",
                            mediaKey = "YOUR_MEDIA_KEY"
                        }
                    }
                }
            }
        };
        request.AddJsonBody(payload);

        // Execute request
        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        // Construct the JSON payload
        String payload = """
        {
          "data": {
            "messages": {
              "key": { "id": "YOUR_UNIQUE_MESSAGE_ID" },
              "message": {
                "imageMessage": {
                  "url": "URL_OF_ENCRYPTED_IMAGE",
                  "mimetype": "image/jpeg",
                  "mediaKey": "YOUR_MEDIA_KEY"
                }
              }
            }
          }
        }
        """;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/decrypt-media"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status Code: " + response.statusCode());
        System.out.println("Response Body: " + response.body());
    }
}
```
```swift
import Foundation

guard let url = URL(string: "https://www.wasenderapi.com/api/decrypt-media") else {
    fatalError("Invalid URL")
}

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let payload: [String: Any] = [
    "data": [
        "messages": [
            "key": ["id": "YOUR_UNIQUE_MESSAGE_ID"],
            "message": [
                "imageMessage": [
                    "url": "URL_OF_ENCRYPTED_IMAGE",
                    "mimetype": "image/jpeg",
                    "mediaKey": "YOUR_MEDIA_KEY"
                ]
            ]
        ]
    ]
]

do {
    request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])
} catch {
    print("Error creating JSON body: \(error)")
    return
}


let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
```
```powershell
# Define the API endpoint and your authentication token
$uri = "https://www.wasenderapi.com/api/decrypt-media"
$apiKey = "YOUR_API_KEY" # Replace with your actual API key

# Set the request headers
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

# Construct the payload as a PowerShell object (hashtable)
# This will be converted to JSON before sending
$payload = @{
    data = @{
        messages = @{
            key = @{
                id = "YOUR_UNIQUE_MESSAGE_ID"
            }
            message = @{
                # You can use imageMessage, videoMessage, etc. here
                imageMessage = @{
                    url      = "URL_OF_ENCRYPTED_IMAGE"
                    mimetype = "image/jpeg"
                    mediaKey = "YOUR_MEDIA_KEY"
                }
            }
        }
    }
}

# Convert the PowerShell object to a JSON string.
# -Depth is important for nested objects.
$jsonPayload = $payload | ConvertTo-Json -Depth 5

# Make the API call using Invoke-RestMethod
try {
    # Invoke-RestMethod sends the request and automatically parses the JSON response
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $jsonPayload

    # Display the response (already a PowerShell object)
    Write-Host "API call successful."
    # Pipe to ConvertTo-Json for a clean, readable output
    $response | ConvertTo-Json
}
catch {
    # This block will run if the API returns an error (e.g., 400, 401, 500)
    Write-Error "The API call failed: $_"

    # You can inspect the full error details for more information
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "Error Response Body: $errorBody"
    }
}
```
```typescript
import axios from 'axios';

async function sendDecryptionRequest() {
  const url = 'https://www.wasenderapi.com/api/decrypt-media';
  const apiKey = 'YOUR_API_KEY'; // <-- Replace with your key

  const payload = {
    data: {
      messages: {
        key: {
          id: 'YOUR_UNIQUE_MESSAGE_ID'
        },
        message: {
          imageMessage: {
            url: 'URL_OF_ENCRYPTED_IMAGE',
            mimetype: 'image/jpeg',
            mediaKey: 'YOUR_MEDIA_KEY'
          }
        }
      }
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log('Success:', response.data);

  } catch (error) {
    // A simple way to log the error response from the server
    console.error('Error:', error.response?.data || error.message);
  }
}

sendDecryptionRequest();
```
```rust
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_url = "https://www.wasenderapi.com/api/decrypt-media";
    let api_key = "YOUR_API_KEY"; // <-- Replace with your key

    // Use the json! macro to create the payload without structs
    let payload = json!({
        "data": {
            "messages": {
                "key": {
                    "id": "YOUR_UNIQUE_MESSAGE_ID"
                },
                "message": {
                    "imageMessage": {
                        "url": "URL_OF_ENCRYPTED_IMAGE",
                        "mimetype": "image/jpeg",
                        "mediaKey": "YOUR_MEDIA_KEY"
                    }
                }
            }
        }
    });

    let client = reqwest::Client::new();
    let response = client
        .post(api_url)
        .bearer_auth(api_key)
        .json(&payload) // Automatically serializes the payload to JSON
        .send()
        .await?;

    // Get the response from the server as text
    let response_text = response.text().await?;

    println!("{}", response_text);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "publicUrl": "https://www.wasenderapi.com/api/decrypted-media/YOUR_UNIQUE_MESSAGE_ID"
}
```
Error Response:
```json
{
  "success": false,
  "error": "No supported media object (image, video, etc.) found in the message."
}
```

### Upload Media File

URL: https://wasenderapi.com/api-docs/messages/upload-media-file
Endpoint: POST /api/upload
Description: This documentation details how to use the media upload endpoint, which supports both raw binary and Base64-encoded file uploads.

Details:
Upload Media File

POST
/api/upload

This endpoint uploads a media file (image, video, audio, sticker, or document) to the server. The file is validated, stored temporarily, and made accessible via a unique URL that is active for 24-hours.

There are two methods for uploading a file:

- Raw Binary Upload: Send the file directly as the request body. This is the most efficient method for file uploads from servers or modern web clients.

- JSON (Base64) Upload: Send a JSON object containing the Base64-encoded file. This is useful for clients where file data is handled as a string.

Request Method 1: Raw Binary Upload

 When uploading a binary file, the Content-Type header is mandatory and must accurately reflect the file's MIME type (e.g., image/jpeg, application/pdf). The server uses this header for validation.

Request Method 2: JSON (Base64) Upload

 To upload via Base64, send a request with Content-Type: application/json and a body containing a base64 string. The MIME type can be provided in two ways:

 - Recommended: Provide the full Data URL scheme within the base64 string. The API will automatically parse the MIME type.

 {
"base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}

- Alternate: Provide the MIME type in a separate mimetype field. This will override any MIME type found in the Data URL.

{
"mimetype": "image/png",
"base64": "iVBORw0KGgoAAAANSUhEUgA..."
}

Validation Rules

The API enforces the following size limits per file category:

 - Documents: 100 MB

 - Images: 16 MB

 - Videos: 50 MB

 - Audio: 16 MB

 - Stickers (webp): 5 MB

Files are also validated by their "magic numbers" to ensure the file content matches its declared type, enhancing security.

Parameters:
- base64 (string, optional): The Base64-encoded file data. Can optionally include the Data URL prefix (e.g., data:image/png;base64,...). Required if using JSON upload method.
- mimetype (string, optional): The MIME type of the file (e.g., image/png). This is only needed for JSON uploads if the base64 string does not include the Data URL prefix.
- Request Body (binary, optional): The request body can either be the raw binary data of the file or a JSON object for Base64 uploads.

Code examples:
```bash
# Raw Binary Upload (Recommended)
curl -X POST "https://wasenderapi.com/api/upload" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@path/to/your/image.jpg"

# JSON (Base64) Upload
curl -X POST "https://wasenderapi.com/api/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE..."
  }'
```
```python
import requests

# Endpoint URL
url = "https://wasenderapi.com/api/upload"

# Path to the local file
file_path = "path/to/your/image.jpg"

# Set the correct MIME type for the file
headers = {
    "Content-Type": "image/jpeg"
}

# Read the file in binary mode and send it in the request body
with open(file_path, "rb") as f:
    response = requests.post(url, headers=headers, data=f)

print(response.json())
```
```javascript
async function uploadFile(file) {
  const url = "https://wasenderapi.com/api/upload";

  if (!file) {
    console.error("No file provided.");
    return;
  }

  try {
    // Send the file object directly as the body.
    // The browser will correctly set Content-Length.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': file.type // The browser provides the file's MIME type
      },
      body: file
    });

    const result = await response.json();
    console.log(result);

  } catch (error) {
    console.error("Upload failed:", error);
  }
}

// Example usage in a browser with an HTML input element:
// const fileInput = document.getElementById('myFileInput');
// uploadFile(fileInput.files[0]);
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$url = 'https://wasenderapi.com/api/upload';
$filePath = 'path/to/your/image.jpg';

try {
    $response = $client->post($url, [
        'headers' => [
            'Content-Type' => 'image/jpeg',
        ],
        // Open the file as a stream for efficient uploading
        'body' => fopen($filePath, 'r')
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://wasenderapi.com/api/upload')
file_path = 'path/to/your/image.jpg'

request = Net::HTTP::Post.new(uri)
request.content_type = 'image/jpeg'
request.body = File.read(file_path)

req_options = {
  use_ssl: uri.scheme == 'https'
}

response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(request)
end

puts "Status Code: #{response.code}"
puts "Response Body: #{response.body}"
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
)

func main() {
    url := "https://wasenderapi.com/api/upload"
    filePath := "path/to/your/image.jpg"

    file, err := os.Open(filePath)
    if err != nil {
        panic(err)
    }
    defer file.Close()

    req, err := http.NewRequest("POST", url, file)
    if err != nil {
        panic(err)
    }

    // The Content-Type header is crucial for the server to validate the file
    req.Header.Set("Content-Type", "image/jpeg")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Printf("Status: %s\n", resp.Status)
    fmt.Printf("Body: %s\n", string(body))
}
```
```csharp
using var client = new HttpClient();
var url = "https://wasenderapi.com/api/upload";
var filePath = "path/to/your/image.jpg";

// Read the file into a byte array
var fileBytes = File.ReadAllBytes(filePath);

// Create content with correct Content-Type
using var content = new ByteArrayContent(fileBytes);
content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");

var response = await client.PostAsync(url, content);

if (response.IsSuccessStatusCode)
{
    var result = await response.Content.ReadAsStringAsync();
    Console.WriteLine(result);
}
else
{
    Console.WriteLine($"Request failed: {response.StatusCode}");
    var error = await response.Content.ReadAsStringAsync();
    Console.WriteLine(error);
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.nio.file.Paths;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        Path filePath = Paths.get("path/to/your/image.jpg");

        // The BodyPublishers.ofFile method streams the file efficiently
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://wasenderapi.com/api/upload"))
            .header("Content-Type", "image/jpeg")
            .POST(HttpRequest.BodyPublishers.ofFile(filePath))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status Code: " + response.statusCode());
        System.out.println("Response Body: " + response.body());
    }
}
```
```swift
import Foundation

guard let url = URL(string: "https://wasenderapi.com/api/upload") else {
    fatalError("Invalid URL")
}

// Assuming the file is in your app's bundle. For user-selected files, use a file picker URL.
guard let fileURL = Bundle.main.url(forResource: "image", withExtension: "jpg") else {
    fatalError("File not found in app bundle")
}

var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")

do {
    // Load the file data into the request body
    let fileData = try Data(contentsOf: fileURL)
    request.httpBody = fileData

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Client Error: \(error)")
            return
        }
        guard let data = data, let result = String(data: data, encoding: .utf8) else {
            print("No data received or data is not valid UTF-8.")
            return
        }
        print("Server Response: \(result)")
    }
    task.resume()

} catch {
    print("Error loading file data: \(error)")
}
```
```powershell
# Define the API endpoint and file path
$uri = "https://wasenderapi.com/api/upload"
$filePath = "C:\path\to\your\image.jpg"

# Set the headers
$headers = @{
    "Content-Type"  = "image/jpeg"
}

# Make the API call using Invoke-RestMethod
try {
    # The -InFile parameter streams the file, which is memory efficient.
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -InFile $filePath

    # Display the response (already a PowerShell object)
    Write-Host "API call successful."
    $response | ConvertTo-Json
}
catch {
    Write-Error "The API call failed: $_"
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "Error Response Body: $errorBody"
    }
}
```
```typescript
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// This example is for a Node.js environment.
// For browsers, use a File object from an input element.
async function uploadFile(filePath: string) {
  const url = 'https://wasenderapi.com/api/upload';
  
  // Create a readable stream from the file
  const fileStream = fs.createReadStream(filePath);
  const stats = fs.statSync(filePath);

  try {
    const response = await axios.post(url, fileStream, {
      headers: {
        'Content-Type': 'image/jpeg',
        // It's good practice to set Content-Length when known
        'Content-Length': stats.size
      },
      // It's important to set a high maxBodyLength for large files
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log('Success:', response.data);
  } catch (error) {
    const err = error as any;
    console.error('Error:', err.response?.data || err.message);
  }
}

uploadFile(path.join(__dirname, 'image.jpg'));
```
```rust
use reqwest::Client;
use std::fs::File;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_url = "https://wasenderapi.com/api/upload";
    let file_path = "path/to/your/image.jpg";

    let client = Client::new();
    
    // Open the file to be streamed in the request body.
    let file = File::open(file_path)?;

    let response = client
        .post(api_url)
        .header("Content-Type", "image/jpeg")
        .body(file) // The body is set to the file stream.
        .send()
        .await?;

    // Check if the request was successful and print the response.
    if response.status().is_success() {
        let response_text = response.text().await?;
        println!("Success: {}", response_text);
    } else {
        println!("Error: Status {}, Body: {}", response.status(), response.text().await?);
    }

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "publicUrl": "https://wasenderapi.com/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
}
```
Error Response:
```json
{
  "success": false,
  "error": "File size exceeds the limit of 16 MB for this file type."
}
```

### Send Text Message

URL: https://wasenderapi.com/api-docs/messages/send-text-message
Endpoint: POST /api/send-message
Description: Sends a plain text message to a recipient.

Details:
Send Basic Text Messages

 Use this endpoint to send basic text messages. You can specify a single recipient phone number (E.164 format) .

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID, or Community Channel JID.
- text (string, required): The text content of the message. Required if no media/contact/location is sent.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "+1234567890",
    "text": "Hello, this is your requested update."
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "to": "+1234567890",
    "text": "Hello, here is your requested update."
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "to": "+1234567890",
      "text": "Hello, this is your update."
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'to' => '+1234567890',
            'text' => 'Hello, here is your update.'
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  to: "+1234567890",
  text: "Hello, here is your message." 
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "to":   "+1234567890",
        "text": "Hello, here is your message.",
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""to"": ""+1234567890"",
            ""text"": ""Hello, this is your personal message.""
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "to": "+1234567890",
                "text": "Hello, this is your personal message."
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "to": "+1234567890",
    "text": "Hello, this is your personal message!"
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "text": "Hello, this is your personal message!"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "to": "+1234567890", 
        "text": "Sending a personal message!"
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({"to": "+1234567890", "text": "Sending a text message!"}))  
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Image Message

URL: https://wasenderapi.com/api-docs/messages/send-image-message
Endpoint: POST /api/send-message
Description: Sends a message with an image attached via a URL.

Details:
Send Image Message

 Send a message that includes an image. Provide the image via a publicly accessible URL in the imageUrl parameter. You can optionally include caption text in the text parameter.

 Supported image formats: JPEG, PNG. Maximum file size: 5MB.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- imageUrl (string, required): URL of the image to send.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Check out this image!",
      "imageUrl": "https://wasenderapi.com/logo.png"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "text": "Check out this image!", "imageUrl": "https://wasenderapi.com/logo.png"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'text' => 'Check out this image!',
            'imageUrl' => 'https://wasenderapi.com/logo.png',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "text": "Check out this image!",
    "imageUrl": "https://wasenderapi.com/logo.png"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","text":"Check out this image!","imageUrl":"https://wasenderapi.com/logo.png"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Video Message

URL: https://wasenderapi.com/api-docs/messages/send-video-message
Endpoint: POST /api/send-message
Description: Sends a message with a video attached via a URL.

Details:
Send Video Message

 Send a message that includes a video. Provide the video via a publicly accessible URL in the videoUrl parameter. You can optionally include caption text in the text parameter.

 Supported video formats: MP4, 3GPP. Maximum file size: 50MB.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- videoUrl (string, required): URL of the video to send.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Training video!",
      "videoUrl": "https://example.com/training-video.mp4"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "text": "Training video!", "videoUrl": "https: //example.com/training-video.mp4"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'text' => 'Training video!',
            'videoUrl' => 'https://example.com/training-video.mp4',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "text": "Training video!",
    "videoUrl": "https://example.com/training-video.mp4"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","text":"Training video!","videoUrl":"https://example.com/training-video.mp4"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Document Message

URL: https://wasenderapi.com/api-docs/messages/send-document-message
Endpoint: POST /api/send-message
Description: Sends a message with a document attached via a URL.

Details:
Send Document Message

 Send a message with a document attached. Provide the document via a publicly accessible URL in the documentUrl parameter. You can optionally include caption text in the text parameter and specify a filename.

 Most common document types are supported (PDF, DOCX, XLSX, etc.). Maximum file size: 100MB.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- documentUrl (string, required): URL of the document to send.
- fileName (string, optional): The file name of the document. If not provided, document.{extension} will be used.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Quarterly report",
      "documentUrl": "https://example.com/report.pdf",
      "fileName:"report-02-2025.pdf"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "text": "Quarterly report", "documentUrl": "https: //example.com/report.pdf"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'text' => 'Quarterly report',
            'documentUrl' => 'https://example.com/report.pdf',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "text": "Quarterly report",
    "documentUrl": "https://example.com/report.pdf"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","text":"Quarterly report","documentUrl":"https://example.com/report.pdf"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Audio Message

URL: https://wasenderapi.com/api-docs/messages/send-audio-message
Endpoint: POST /api/send-message
Description: Sends a message with an audio file attached via a URL.

Details:
Send Audio Message

 Send a message with an audio file attached. Provide the audio file via a publicly accessible URL in the audioUrl parameter.

 Supported audio formats: AAC, MP3, OGG, AMR. Maximum file size: 16MB.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- audioUrl (string, required): URL of the audio file to send (sent as voice note).

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "audioUrl": "https://example.com/announcement.mp3"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "audioUrl": "https: //example.com/announcement.mp3"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'audioUrl' => 'https://example.com/announcement.mp3',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "audioUrl": "https://example.com/announcement.mp3"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","audioUrl":"https://example.com/announcement.mp3"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Sticker Message

URL: https://wasenderapi.com/api-docs/messages/send-sticker-message
Endpoint: POST /api/send-message
Description: Sends a message with a sticker attached via a URL (supports .webp format).

Details:
Send Sticker Message

 Send a message with a sticker attached. Provide the sticker file (must be .webp format) via a publicly accessible URL in the stickerUrl parameter.

 Only the WEBP format is supported for stickers. Maximum file size: 100KB.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- stickerUrl (string, required): URL of the sticker (.webp) to send.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "stickerUrl": "https://example.com/sticker.webp"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "stickerUrl": "https: //example.com/sticker.webp"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'stickerUrl' => 'https://example.com/sticker.webp',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "stickerUrl": "https://example.com/sticker.webp"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","stickerUrl":"https://example.com/sticker.webp"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Contact Card

URL: https://wasenderapi.com/api-docs/messages/send-contact-card
Endpoint: POST /api/send-message
Description: Sends a message containing a contact card.

Details:
Send Contact Card

 Send a message containing a contact card (vCard). Provide the contact details within the contact object parameter.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- contact (object, required): Contact card object.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "contact": {
          "name": "Support Team",
          "phone": "+1234567890"
      }
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "contact": {"name": "Support Team", "phone": "+1234567890"}}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'contact' => 
            [
            'name' => 'Support Team',
            'phone' => '+1234567890',
            ),
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "contact": {
        "name": "Support Team",
        "phone": "+1234567890"
    }
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","contact":{"name":"Support Team","phone":"+1234567890"}}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Resend Failed Message

URL: https://wasenderapi.com/api-docs/messages/resend-failed-message
Endpoint: POST /api/messages/{message}/resend
Description: Initiates the resending of a previously failed message from the logs.

Details:
Resend Failed Message

 This endpoint allows you to attempt to resend a message from your logs that has previously failed. The message must have a status of "failed" for this operation to be permitted.

 Important: Message logging must be enabled for your session to use this feature, as the endpoint relies on the stored message content to perform the resend. The API key you use must belong to the same session that originally sent the message.

 Upon a successful request, the message status is updated to "in_progress" and it is re-queued for sending. The success response indicates that the resend has been initiated, not that it has been delivered.

Parameters:
- message (integer, required): The unique ID of the failed message log to be resent.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend" 
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$messageId = 'failed-msg-id-123';
$url = 'https://www.wasenderapi.com/api/messages/' . $messageId . '/resend';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend"
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'post',
      url: 'https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/messages/failed-msg-id-123/resend";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "message": "Message resend initiated successfully."
}
```
Error Response (Not Failed):
```json
{
    "success": false,
    "error": "Only messages with status 'failed' can be resent."
}
```
Error Response (Unauthorized):
```json
{
    "success": false,
    "error": "You are not authorized to modify this message."
}
```

### Send Location

URL: https://wasenderapi.com/api-docs/messages/send-location
Endpoint: POST /api/send-message
Description: Sends a message containing a location pin.

Details:
Send Location

 Send a message containing a location pin. Provide the latitude and longitude within the location object parameter. You can optionally include a name and address for the location.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- location (object, required): Location object.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "+1234567890",
      "text": "Our office location",
      "location": {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "name": "Company HQ",
          "address": "123 Business St, San Francisco, CA 94105"
      }
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "+1234567890", "text": "Our office location", "location": {"latitude": 37.7749, "longitude": -122.4194, "name": "Company HQ", "address": "123 Business St,  San Francisco,  CA 94105"}}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '+1234567890',
            'text' => 'Our office location',
            'location' => 
            [
            'latitude' => 37.7749,
            'longitude' => -122.4194,
            'name' => 'Company HQ',
            'address' => '123 Business St, San Francisco, CA 94105',
            ),
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "text": "Our office location",
    "location": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "name": "Company HQ",
        "address": "123 Business St, San Francisco, CA 94105"
    }
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"+1234567890","text":"Our office location","location":{"latitude":37.7749,"longitude":-122.4194,"name":"Company HQ","address":"123 Business St, San Francisco, CA 94105"}}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Poll Message

URL: https://wasenderapi.com/api-docs/messages/send-poll-message
Endpoint: POST /api/send-message
Description: Sends a message containing a poll with multi select support.

Details:
Send Poll Message

 Send a message that lets recipients vote on a question. Put the poll’s
 question and answer options inside the poll object, and (if
 needed) set multiSelect to allow voters to pick more than one
 option.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID.
- poll (object, required): Poll object.
- pool.multiSelect (boolean, optional): Allow multiple options to be selected by the user (default false)
- pool.question (string, required): The question you want to ask in the poll
- pool.options (string[], required): Array of answer options for the poll (min:2 - max:12)

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
      "to": "+1234567890",
      "poll": {
          "question": "What is your favorite color?",
          "options": [
              "Blue",
              "Green",
              "Red",
              "Yellow"
          ],
          "multiSelect": false
      }
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "to": "+1234567890",
    "poll": {
        "question": "What is your favorite color?",
        "options": [
            "Blue",
            "Green",
            "Red",
            "Yellow"
        ],
        "multiSelect": False
    }
}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "to": "+1234567890",
      "poll": {
        "question": "What is your favorite color?",
        "options": [
          "Blue",
          "Green",
          "Red",
          "Yellow"
        ],
        "multiSelect": false
      }
    })
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'to' => '+1234567890',
            'poll' => [
                'question' => 'What is your favorite color?',
                'options' => [
                    'Blue',
                    'Green',
                    'Red',
                    'Yellow'
                ],
                'multiSelect' => false
            ]
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

poll_payload = {
  to: "+1234567890",
  poll: {
    question: "What is your favorite color?",
    options: [
      "Blue",
      "Green",
      "Red",
      "Yellow"
    ],
    multiSelect: false
  }
}

request.body = poll_payload.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{
        "to": "+1234567890",
        "poll": {
            "question": "What is your favorite color?",
            "options": [
                "Blue",
                "Green",
                "Red",
                "Yellow"
            ],
            "multiSelect": false
        }
    }`)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        
        var body = @"{
            ""to"": ""+1234567890"",
            ""poll"": {
                ""question"": ""What is your favorite color?"",
                ""options"": [
                    ""Blue"",
                    ""Green"",
                    ""Red"",
                    ""Yellow""
                ],
                ""multiSelect"": false
            }
        }";
        
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
        {
            "to": "+1234567890",
            "poll": {
                "question": "What is your favorite color?",
                "options": [
                    "Blue",
                    "Green",
                    "Red",
                    "Yellow"
                ],
                "multiSelect": false
            }
        }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "to": "+1234567890",
    "poll": [
        "question": "What is your favorite color?",
        "options": [
            "Blue",
            "Green",
            "Red",
            "Yellow"
        ],
        "multiSelect": false
    ]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "+1234567890",
    "poll": {
        "question": "What is your favorite color?",
        "options": [
            "Blue",
            "Green",
            "Red",
            "Yellow"
        ],
        "multiSelect": false
    }
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        to: "+1234567890",
        poll: {
          question: "What is your favorite color?",
          options: [
            "Blue",
            "Green",
            "Red",
            "Yellow"
          ],
          multiSelect: false
        }
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "to": "+1234567890",
            "poll": {
                "question": "What is your favorite color?",
                "options": [
                    "Blue",
                    "Green",
                    "Red",
                    "Yellow"
                ],
                "multiSelect": false
            }
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Send Quoted Message

URL: https://wasenderapi.com/api-docs/messages/send-quoted-message
Endpoint: POST /api/send-message
Description: Sends a message that quotes or replies to a previous message. This is useful for creating conversational context.

Details:
Send Quoted Messages

 Use this endpoint to send a message in reply to a previously sent message. To do this, you must provide the replyTo parameter with the msgId of the message you wish to quote. The msgId is returned in the success response of any message sending request. You can quote any type of message (text, image, etc.) by including the replyTo parameter alongside the content of your new message.

Parameters:
- to (string, required): Recipient phone number in E.164 format or, Group JID, or Community Channel JID.
- text (string, optional): The text content of the message. Required if no media/contact/location is sent.
- replyTo (integer, optional): The msgId of the message to reply to. The msgId is returned in the success response of any message sending request.
- imageUrl (string, optional): URL of the image to send.
- videoUrl (string, optional): URL of the video to send.
- documentUrl (string, optional): URL of the document to send.
- audioUrl (string, optional): URL of the audio file to send (sent as voice note).
- stickerUrl (string, optional): URL of the sticker (.webp) to send.
- contact (object, optional): Contact card object.
- location (object, optional): Location object.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "text": "This is a reply to the previous message.",
    "replyTo": 12345
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "to": "+1234567890",
    "text": "This is a reply to the previous message.",
    "replyTo": 12345
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "to": "+1234567890",
      "text": "This is a reply to the previous message.",
      "replyTo": 12345
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'to' => '+1234567890',
            'text' => 'This is a reply to the previous message.',
            'replyTo' => 12345
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  to: "+1234567890",
  text: "This is a reply to the previous message.",
  replyTo: 12345
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "to":      "+1234567890",
        "text":    "This is a reply to the previous message.",
        "replyTo": 12345,
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var body = new {
            to = "+1234567890",
            text = "This is a reply to the previous message.",
            replyTo = 12345
        };
        request.AddJsonBody(body);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "to": "+1234567890",
                "text": "This is a reply to the previous message.",
                "replyTo": 12345
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "to": "+1234567890",
    "text": "This is a reply to the previous message!",
    "replyTo": 12345
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @{ 
    to = "+1234567890"; 
    text = "This is a reply to the previous message!"; 
    replyTo = 12345 
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "to": "+1234567890", 
        "text": "This is a reply to the previous message!",
        "replyTo": 12345
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "to": "+1234567890", 
            "text": "This is a reply to the previous message!", 
            "replyTo": 12345
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Edit a Message

URL: https://wasenderapi.com/api-docs/messages/edit-a-message
Endpoint: PUT /api/messages/{msgId}
Description: Edits the text content of a previously sent message. Note: This is usually only possible for a short period after the message was sent.

Details:
Edit a Message

 Edits the text content of a previously sent message. Note: This is usually only possible for a short period after the message was sent.

Parameters:
- msgId (integer, required): The ID of the message to retrieve information for its returned from send-message endpoints.
- text (string, required): The new text content for the message.

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/messages/{msgId}"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "text": "This is the new message content",
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/messages/{msgId}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"text": "This is the new message content",}
response = requests.put(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/messages/{msgId}", {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"text": "This is the new message content"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/messages/{msgId}';

try {
    $response = $client->put($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => ['text' => 'This is the new message content']
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/messages/{msgId}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Put.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"text": "This is the new message content"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/messages/{msgId}"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"text": "This is the new message content"}`)
    req, err := http.NewRequest("PUT", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/messages/{msgId}");
        var request = new RestRequest(Method.PUT);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"text": "This is the new message content"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/messages/{msgId}"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("PUT", HttpRequest.BodyPublishers.ofString("{"text": "This is the new message content"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/messages/{msgId}")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"text": "This is the new message content"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/messages/{msgId}"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "text": "This is the new message content",
}
'@

$response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'PUT',
      url: 'https://www.wasenderapi.com/api/messages/{msgId}',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"text": "This is the new message content"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/messages/{msgId}";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.PUT(url)
        .headers(headers)
        .json(&json!({"text": "This is the new message content"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "remoteJid": "123456789@s.whatsapp.net",
        "id": "EN82FV0387IVR54JTE2R1",
        "msgId": 100000,
        "key": {
            "id": "EN82FV0387IVR54JTE2R1",
            "fromMe": true,
            "remoteJid": "123456789@s.whatsapp.net"
        },
      "message": {
            "protocolMessage": {
                "key": {
                    "id": "EN82FV0387IVR54JTE2R1",
                    "fromMe": true,
                    "remoteJid": "123456789@s.whatsapp.net"
                },
                "type": 14,
                "timestampMs": 1751302295563,
                "editedMessage": {
                    "extendedTextMessage": {
                        "text": "updated"
                    }
                }
            }
        "messageTimestamp": "1751297488",
        "status": 1
    }
}
```

### Get Message Info

URL: https://wasenderapi.com/api-docs/messages/get-message-info
Endpoint: GET /api/messages/{msgId}/info
Description: Retrieves detailed information about a specific message, such as its content, sender, receiver, status and timestamps.

Details:
Get Message Info

Retrieves detailed information about a specific message, such as its content, sender, receiver, status and timestamps.

 Status Codes

 Status Code
 Description
 Explanation

 0
 ERROR
 The message failed to send due to an error.

 1
 PENDING
 The message is queued and waiting to be sent.

 2
 SENT
 The message has been sent from the server but not yet delivered.

 3
 DELIVERED
 The message has reached the recipient’s device.

 4
 READ
 The recipient has opened and read the message.

 5
 PLAYED
 The recipient has played the media message (e.g., audio or video).

Parameters:
- msgId (integer, required): The ID of the message to retrieve information for its returned from send-message endpoints.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/messages/{msgId}/info"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/messages/{msgId}/info"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/messages/{msgId}/info", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/messages/{msgId}/info';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/messages/{msgId}/info')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/messages/{msgId}/info"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/messages/{msgId}/info");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/messages/{msgId}/info"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/messages/{msgId}/info")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/messages/{msgId}/info"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/messages/{msgId}/info',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/messages/{msgId}/info";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "remoteJid": "123456789@s.whatsapp.net",
        "id": "EN82FV0387IVR54JTE2R1",
        "msgId": 100000,
        "key": {
            "id": "EN82FV0387IVR54JTE2R1",
            "fromMe": true,
            "remoteJid": "123456789@s.whatsapp.net"
        },
        "message": {
            "extendedTextMessage": {
                "text": "quoted",
                "contextInfo": {
                    "stanzaId": "SNE5U4M5OSPWHXHN1WBGV",
                    "participant": "123456789@s.whatsapp.net",
                    "quotedMessage": {
                        "extendedTextMessage": {
                            "text": "quoted"
                        }
                    }
                }
            }
        },
        "messageTimestamp": "1751297488",
        "status": 2
    }
}
```

### Delete a Message

URL: https://wasenderapi.com/api-docs/messages/delete-a-message
Endpoint: DELETE /api/messages/{msgId}
Description: Deletes a specific message for everyone. Note: This is usually only possible for a short period after the message was sent.

Details:
Delete a Message

 Deletes a specific message for everyone. Note: This is usually only possible for a short period after the message was sent.

Parameters:
- msgId (integer, required): The ID of the message to retrieve information for its returned from send-message endpoints.

Code examples:
```bash
curl -X DELETE "https://www.wasenderapi.com/api/messages/{msgId}"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
```
```python
import requests

url = "https://www.wasenderapi.com/api/messages/{msgId}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.delete(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/messages/{msgId}", {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/messages/{msgId}';

try {
    $response = $client->delete($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/messages/{msgId}')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Delete.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/messages/{msgId}"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("DELETE", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/messages/{msgId}");
        var request = new RestRequest(Method.DELETE);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/messages/{msgId}"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("DELETE", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/messages/{msgId}")!
var request = URLRequest(url: url)
request.httpMethod = "DELETE"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/messages/{msgId}"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method DELETE -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'DELETE',
      url: 'https://www.wasenderapi.com/api/messages/{msgId}',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/messages/{msgId}";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.DELETE(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "message": "Message deleted successfully."

}
```

### Mark Message as Read

URL: https://wasenderapi.com/api-docs/messages/mark-message-as-read
Endpoint: POST /api/messages/read
Description: Marks a specific received WhatsApp message as read (blue ticks).

Details:
Mark Message as Read

 This endpoint allows you to programmatically mark a message as read, which will trigger the "blue ticks" on the sender's device.

 To mark a message as read, you must pass the exact key object associated with the message. You typically receive this key object in incoming message webhooks (e.g., messages.received).

 The key object must contain three properties: id, remoteJid, and fromMe.

Parameters:
- key (object, required): The exact message key object representing the message you want to mark as read.
- key.id (string, required): The unique message ID (e.g., 3EB06A5E244031B4A5D1).
- key.remoteJid (string, required): The JID of the chat where the message was sent (e.g., 1234567890@s.whatsapp.net).
- key.fromMe (boolean, required): Indicates if the message was sent by you (`true`) or received (`false`). Usually `false` when marking incoming messages as read.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/messages/read" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "key": {
        "id": "3EB06A5E244031B4A5D1",
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": false
    }
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/messages/read"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "key": {
        "id": "3EB06A5E244031B4A5D1",
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": False
    }
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/messages/read", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "key": {
          "id": "3EB06A5E244031B4A5D1",
          "remoteJid": "1234567890@s.whatsapp.net",
          "fromMe": false
      }
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/messages/read';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'key' => [
                'id' => '3EB06A5E244031B4A5D1',
                'remoteJid' => '1234567890@s.whatsapp.net',
                'fromMe' => false
            ]
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/messages/read')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  key: {
    id: "3EB06A5E244031B4A5D1",
    remoteJid: "1234567890@s.whatsapp.net",
    fromMe: false
  }
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/messages/read"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "key": map[string]interface{}{
            "id": "3EB06A5E244031B4A5D1",
            "remoteJid": "1234567890@s.whatsapp.net",
            "fromMe": false,
        },
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/messages/read");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""key"": {
                ""id"": ""3EB06A5E244031B4A5D1"",
                ""remoteJid"": ""1234567890@s.whatsapp.net"",
                ""fromMe"": false
            }
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "key": {
                    "id": "3EB06A5E244031B4A5D1",
                    "remoteJid": "1234567890@s.whatsapp.net",
                    "fromMe": false
                }
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/messages/read"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/messages/read")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "key": [
        "id": "3EB06A5E244031B4A5D1",
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": false
    ]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/messages/read"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "key": {
        "id": "3EB06A5E244031B4A5D1",
        "remoteJid": "1234567890@s.whatsapp.net",
        "fromMe": $false
    }
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/messages/read',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "key": {
            "id": "3EB06A5E244031B4A5D1",
            "remoteJid": "1234567890@s.whatsapp.net",
            "fromMe": false
        }
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/messages/read";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "key": {
                "id": "3EB06A5E244031B4A5D1",
                "remoteJid": "1234567890@s.whatsapp.net",
                "fromMe": false
            }
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "status": "read"
    }
}
```
Error Response (Validation):
```json
{
    "success": false,
    "error": "The key.id field is required and must be a non-empty string."
}
```

### Send View Once Message

URL: https://wasenderapi.com/api-docs/messages/send-view-once-message
Endpoint: POST /api/send-message
Description: Sends an image, video, or audio message that can only be viewed a single time.

Details:
Send View Once Media

 This feature allows you to send media (an image, video, or audio file) that will disappear from the chat after the recipient has opened it once. It uses the same /api/send-message endpoint as other message types.

 To enable this functionality, you must include the viewOnce: true parameter in your request body, along with the media url (imageUrl, videoUrl, or audioUrl).

 The recipient will see a placeholder indicating a "View Once" message and will not be able to save, forward, or screenshot the media (on most devices).

Parameters:
- to (string, required): Recipient's JID (e.g., 1234567890@s.whatsapp.net or 123456789-987654321@g.us).
- viewOnce (boolean, required): Must be set to `true` to send the media as a view-once message.
- imageUrl (string, optional): The direct URL of the image to be sent. Required if `videoUrl` or `audioUrl` are not provided.
- videoUrl (string, optional): The direct URL of the video to be sent. Required if `imageUrl` or `audioUrl` are not provided.
- audioUrl (string, optional): The direct URL of the audio to be sent. Required if `imageUrl` or `videoUrl` are not provided.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "1234567890@s.whatsapp.net",
    "imageUrl":"https://example.com/image.jpg",
    "viewOnce": true
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "to": "1234567890@s.whatsapp.net",
    "imageUrl":"https://example.com/image.jpg",
    "viewOnce": True
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "to": "1234567890@s.whatsapp.net",
      "imageUrl":"https://example.com/image.jpg",
      "viewOnce": true
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'to' => '1234567890@s.whatsapp.net',
            'imageUrl' =>'https://example.com/image.jpg',
            'viewOnce' => true
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  to: "1234567890@s.whatsapp.net",
  imageUrl: "https://example.com/image.jpg",
  viewOnce: true
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "to":   "1234567890@s.whatsapp.net",
        "imageUrl": "https://example.com/image.jpg",
        "viewOnce": true,
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""to"": ""1234567890@s.whatsapp.net"",
            ""imageUrl"": "https://example.com/image.jpg",
            ""viewOnce"": true
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "to": "1234567890@s.whatsapp.net",
                "imageUrl":"https://example.com/image.jpg",
                "viewOnce": true
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "to": "1234567890@s.whatsapp.net",
    "imageUrl": "https://example.com/image.jpg",
    "viewOnce": true
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "to": "1234567890@s.whatsapp.net",
    "imageUrl":"https://example.com/image.jpg",
    "viewOnce": $true
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "to": "1234567890@s.whatsapp.net", 
        "imageUrl":"https://example.com/image.jpg",
        "viewOnce": true
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "to": "1234567890@s.whatsapp.net",
            "imageUrl":"https://example.com/image.jpg",
            "viewOnce": true
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "msgId": 100002,
        "jid": "1234567890@s.whatsapp.net",
        "status": "in_progress"
    }
}
```

### Create a New Group

URL: https://wasenderapi.com/api-docs/groups/create-a-new-group
Endpoint: POST /api/groups
Description: Creates a new WhatsApp group with a given name and a list of participants.

Details:
Create a new group

 Creates a new WhatsApp group with a given name and a list of participants.

Parameters:
- name (string, required): The name of the group to be created.
- participants (string[], optional): An array of participant JIDs to add to the group.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/groups" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Group", "participants": ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]}'
```
```python
import requests
import json

url = "https://www.wasenderapi.com/api/groups"
payload = {
    "name": "My New Group",
    "participants": ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]
}
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My New Group',
      participants: ['1234567890@s.whatsapp.net', '0987654321@s.whatsapp.net']
    })
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ],
        'json' => [
            'name' => 'My New Group',
            'participants' => ['1234567890@s.whatsapp.net', '0987654321@s.whatsapp.net']
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = JSON.generate({
  name: "My New Group",
  participants: ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]
})

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups"
    apiKey := "YOUR_API_KEY"

    payload := map[string]interface{}{
        "name":         "My New Group",
        "participants": []string{"1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"},
    }
    jsonData, err := json.Marshal(payload)
    if err != nil {
        panic(err)
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = new {
            name = "My New Group",
            participants = new[] { "1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net" }
        };
        request.AddJsonBody(body);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        String requestBody = "{\"name\":\"My New Group\",\"participants\":[\"1234567890@s.whatsapp.net\",\"0987654321@s.whatsapp.net\"]}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "name": "My New Group",
    "participants": ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]
]

do {
    request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
} catch {
    print("Error: unable to serialize JSON body")
    return
}

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @{
    name         = "My New Group"
    participants = @("1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net")
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/groups',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        name: 'My New Group',
        participants: ['1234567890@s.whatsapp.net', '0987654321@s.whatsapp.net']
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "name": "My New Group",
            "participants": ["1234567890@s.whatsapp.net", "0987654321@s.whatsapp.net"]
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
[
  {
    "title": "Success Response",
    "code": {
      "success": true,
      "data": {
        "id": "123456789-987654321@g.us",
        "owner": "1122334455@s.whatsapp.net",
        "subject": "My New Group",
        "creation": 1678886400,
        "participants": [
          {
            "id": "1122334455@s.whatsapp.net",
            "admin": "superadmin"
          },
          {
            "id": "1234567890@s.whatsapp.net",
            "admin": null
          },
          {
            "id": "0987654321@s.whatsapp.net",
            "admin": null
          }
        ]
      }
    }
  }
]
```

### Get All Groups

URL: https://wasenderapi.com/api-docs/groups/get-all-groups
Endpoint: GET /api/groups
Description: Retrieves a list of all WhatsApp groups the connected account is a member of.

Details:
Get All Groups

 Retrieve a list of all WhatsApp groups that the connected WhatsApp account is currently a part of.

Parameters:
- paginated (boolean, optional): When true, returns {data: {items, pagination}}. When false, returns {data: [...]}.
- page (integer, optional): Page number (only used when paginated=true).
- limit (integer, optional): Items per page (only used when paginated=true).

Code examples:
```bash
curl "https://www.wasenderapi.com/api/groups"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/groups',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Groups Success Response (non-paginated):
```json
{
  "success": true,
  "data": [
    {
      "jid": "123456789-987654321@g.us",
      "name": "Group Name",
      "imgUrl": null
    }
  ]
}
```
Groups Success Response (paginated=true):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "jid": "123456789-987654321@g.us",
        "name": "Group Name",
        "imgUrl": null
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### Get Group Metadata

URL: https://wasenderapi.com/api-docs/groups/get-group-metadata
Endpoint: GET /api/groups/{groupJid}/metadata
Description: Retrieves metadata for a specific group (e.g., subject, description, creation date, owner).

Details:
Get Group Metadata

 Retrieves metadata for a specific group (e.g., subject, description, creation date, owner).

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/groups/{groupJid}/metadata"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/metadata"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/metadata", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/metadata';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/metadata')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/metadata"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/metadata");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/metadata"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/metadata")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/metadata"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/metadata',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/metadata";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "jid": "123456789-987654321@g.us",
        "subject": "Group Subject",
        "creation": 1678886400,
        "owner": "owner_id",
        "desc": "Group Description",
        "participants": [
            {
                "jid": "123456789",
                "isAdmin": true,
                "isSuperAdmin": false
            },
            {
                "jid": "participant2",
                "isAdmin": false,
                "isSuperAdmin": false
            }
        ]
    }
}
```

### Send Group Message

URL: https://wasenderapi.com/api-docs/groups/send-group-message
Endpoint: POST /api/send-message
Description: Sends a message to a specific WhatsApp group using its Group ID.

Details:
Send Group Message

 Send a message directly to a WhatsApp group using its unique Group ID (e.g., 123456789-987654321@g.us). Use the /api/groups endpoint to find the IDs of the groups you are in.

 The parameters are the same as sending a regular message, but the to field must contain the Group ID.

Parameters:
- to (string, required): Group ID (e.g., '123-456@g.us').
- text (string, required): The text content of the message. Required if no media/contact/location is sent.
- imageUrl (string, optional): URL of the image to send.
- videoUrl (string, optional): URL of the video to send.
- documentUrl (string, optional): URL of the document to send.
- audioUrl (string, optional): URL of the audio file to send (sent as voice note).
- stickerUrl (string, optional): URL of the sticker (.webp) to send.
- contact (object, optional): Contact card object.
- location (object, optional): Location object.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "123456789-987654321@g.us",
      "text": "Hello everyone in the group!"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "123456789-987654321@g.us", "text": "Hello everyone in the group!"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '123456789-987654321@g.us',
            'text' => 'Hello everyone in the group!',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using System;
using System.Threading.Tasks;
using RestSharp;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.Post);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{""to"":""123456789-987654321@g.us"",""text"":""Hello everyone in the group!""}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{\"to\":\"123456789-987654321@g.us\",\"text\":\"Hello everyone in the group!\"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "123456789-987654321@g.us",
    "text": "Hello everyone in the group!"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"123456789-987654321@g.us","text":"Hello everyone in the group!"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Update Group Participants

URL: https://wasenderapi.com/api-docs/groups/update-group-participants
Endpoint: PUT /api/groups/{groupId}/participants/update
Description: Promote or demote one or more participants in a specific group.

Details:
Update Group Participants' Roles

 This endpoint allows you to change the role of participants within a group. You can either promote a member to an admin or demote an admin back to a regular member.

 This action requires that your session has admin privileges in the target group. You can perform the action on multiple participants in a single API call by including their JIDs in the participants array.

 The action parameter determines the operation to be performed:

 - promote: Grants admin privileges to the specified participants.

 - demote: Revokes admin privileges from the specified participants.

Parameters:
- groupId (string, required): The JID of the group (e.g., 123456789-987654321@g.us).
- action (string, required): The action to perform on the participants. Must be either `promote` or `demote`.
- participants (array, required): An array of user JIDs (strings) to update.

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "action": "promote",
    "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "action": "promote",
    "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
}

response = requests.put(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update", {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "action": "promote",
      "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$groupId = '123456789-987654321@g.us';
$url = 'https://www.wasenderapi.com/api/groups/' . $groupId . '/participants/update';

try {
    $response = $client->put($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'action' => 'promote',
            'participants' => ['111111111@s.whatsapp.net', '222222222@s.whatsapp.net']
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Put.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  action: "promote",
  participants: ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "action": "promote",
        "participants": []string{"111111111@s.whatsapp.net", "222222222@s.whatsapp.net"},
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("PUT", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update");
        var request = new RestRequest(Method.PUT);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""action"": ""promote"",
            ""participants"": [""111111111@s.whatsapp.net"", ""222222222@s.whatsapp.net""]
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "action": "promote",
                "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "action": "promote",
    "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "action": "promote",
    "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'PUT',
      url: 'https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "action": "promote",
        "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/participants/update";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.put(url)
        .headers(headers)
        .json(&json!({
            "action": "promote",
            "participants": ["111111111@s.whatsapp.net", "222222222@s.whatsapp.net"]
        }))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "participants": ["111111111@s.whatsapp.net"]
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "Failed to promote group participants: You are not an admin in this group."
}
```

### Get Group Participants

URL: https://wasenderapi.com/api-docs/groups/get-group-participants
Endpoint: GET /api/groups/{groupJid}/participants
Description: Retrieves a list of participants for a specific group. Warning: If the list is empty, it may mean no participants are currently synced or available, or the initial sync is still in progress. If you connected your session before 5/8/2025, you must reconnect it to sync them correctly.

Details:
Get Group Participants

 Retrieves a list of participants for a specific group. Warning: If the list is empty, it may mean no participants are currently synced or available, or the initial sync is still in progress. If you connected your session before 5/8/2025, you must reconnect it to sync them correctly.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/groups/{groupJid}/participants"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/participants", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/participants';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/participants')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/participants"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/participants");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/participants"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/participants")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/participants"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/participants',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": [
  {
    "id": "123456789012345@lid"
  },
  {
    "id": "987654321098765@lid",
    "admin": "superadmin"
  }
]
}
```

### Send Message with Mentions

URL: https://wasenderapi.com/api-docs/groups/send-message-with-mentions
Endpoint: POST /api/send-message
Description: Sends a message to a group that specifically mentions one or more participants.

Details:
Mention Users in a Group Message

 This functionality allows you to send a message to a group that triggers a notification for specific members, even if they have muted the group.

 To use mentions, you must provide three parameters in your request:

 - to: The JID of the group (ending in @g.us).

 - text: The message content. For the mention to be visually displayed in the WhatsApp client, you must include the "@" symbol followed by the user's number (e.g., "Hello @1234567890").

 - mentions: An array of strings, where each string is the JID of a group member you want to mention (e.g., ["1234567890@s.whatsapp.net"]).

 This feature can also be combined with media messages by including the appropriate media parameters alongside the text and mentions.

Parameters:
- to (string, required): The Group JID, which must end in @g.us.
- text (string, required): The text content of the message. Should include the @ mention for visual display.
- mentions (array, required): An array of user JIDs (strings) to be mentioned in the group message.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "123456789-987654321@g.us",
    "text": "Hello @1234567890, check this out!",
    "mentions": ["1234567890@s.whatsapp.net"]
}'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "to": "123456789-987654321@g.us",
    "text": "Hello @1234567890, check this out!",
    "mentions": ["1234567890@s.whatsapp.net"]
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "to": "123456789-987654321@g.us",
      "text": "Hello @1234567890, check this out!",
      "mentions": ["1234567890@s.whatsapp.net"]
    })
  });

  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'to' => '123456789-987654321@g.us',
            'text' => 'Hello @1234567890, check this out!',
            'mentions' => ['1234567890@s.whatsapp.net']
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

request.body = {
  to: "123456789-987654321@g.us",
  text: "Hello @1234567890, check this out!",
  mentions: ["1234567890@s.whatsapp.net"]
}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payloadMap := map[string]interface{}{
        "to":   "123456789-987654321@g.us",
        "text": "Hello @1234567890, check this out!",
        "mentions": []string{"1234567890@s.whatsapp.net"},
    }
    payload, _ := json.Marshal(payloadMap)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");

        var body = @"{
            ""to"": ""123456789-987654321@g.us"",
            ""text"": ""Hello @1234567890, check this out!"",
            ""mentions"": [""1234567890@s.whatsapp.net""]
        }";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        String jsonPayload = """
            {
                "to": "123456789-987654321@g.us",
                "text": "Hello @1234567890, check this out!",
                "mentions": ["1234567890@s.whatsapp.net"]
            }
        """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = [
    "to": "123456789-987654321@g.us",
    "text": "Hello @1234567890, check this out!",
    "mentions": ["1234567890@s.whatsapp.net"]
]

let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type"  = "application/json"
}
$body = @'
{
    "to": "123456789-987654321@g.us",
    "text": "Hello @1234567890, check this out!",
    "mentions": ["1234567890@s.whatsapp.net"]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {
        "to": "123456789-987654321@g.us", 
        "text": "Hello @1234567890, check this out!",
        "mentions": ["1234567890@s.whatsapp.net"]
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({
            "to": "123456789-987654321@g.us", 
            "text": "Hello @1234567890, check this out!",
            "mentions": ["1234567890@s.whatsapp.net"]
        }))  
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100001,
    "jid": "123456789-987654321@g.us",
    "status": "in_progress"
  }
}
```

### Add Group Participants

URL: https://wasenderapi.com/api-docs/groups/add-group-participants
Endpoint: POST /api/groups/{groupJid}/participants/add
Description: Adds participants to a specific group. Requires admin privileges in the group.

Details:
Add Group Participants

 Adds participants to a specific group. Requires admin privileges in the group.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.
- participants (array, required): Array of participant JIDs in E.164 format (international phone numbers) e.g., 1234567890.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "participants": [
          "number1",
          "number2"
      ]
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"participants": ["number1", "number2"]}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/participants/add", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"participants":["number1","number2"]})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/participants/add';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'participants' => 
            [
            0 => 'number1',
            1 => 'number2',
            ),
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/participants/add')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"participants":["number1","number2"]}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"participants":["number1","number2"]}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/participants/add");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"participants":["number1","number2"]}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"participants":["number1","number2"]}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"participants":["number1","number2"]}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "participants": [
        "number1",
        "number2"
    ]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/participants/add',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"participants":["number1","number2"]}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/add";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"participants":["number1","number2"]}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": [
        {
            "status": 200,
            "jid": "123456789",
            "message": "added"
        },
        {
            "status": 403,
            "jid": "participant2",
            "message": "not-authorized"
        }
    ]
}
```

### Get Group Profile Picture

URL: https://wasenderapi.com/api-docs/groups/get-group-profile-picture
Endpoint: GET /api/groups/{groupJid}/picture
Description: Retrieves the URL of the profile picture for a specific group.

Details:
Get Group Profile Picture

 Retrieves the URL of the profile picture for a specific group.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/groups/{groupJid}/picture"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/picture"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/picture", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/picture';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/picture')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/picture"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/picture");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/picture"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/picture")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/picture"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/picture',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/picture";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "imgUrl": "https:\/\/profile.pic.url\/image.jpg"
    }
}
```

### Remove Group Participants

URL: https://wasenderapi.com/api-docs/groups/remove-group-participants
Endpoint: POST /api/groups/{groupJid}/participants/remove
Description: Removes participants from a specific group. Requires admin privileges in the group.

Details:
Remove Group Participants

 Removes participants from a specific group. Requires admin privileges in the group.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.
- participants (array, required): Array of participant JIDs in E.164 format (international phone numbers) e.g., 1234567890.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "participants": [
          "number1",
          "number2"
      ]
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"participants": ["number1", "number2"]}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"participants":["number1","number2"]})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'participants' => 
            [
            0 => 'number1',
            1 => 'number2',
            ),
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"participants":["number1","number2"]}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"participants":["number1","number2"]}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"participants":["number1","number2"]}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{"participants":["number1","number2"]}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"participants":["number1","number2"]}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "participants": [
        "number1",
        "number2"
    ]
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"participants":["number1","number2"]}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/participants/remove";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"participants":["number1","number2"]}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": [
        {
            "status": 200,
            "jid": "123456789",
            "message": "removed"
        },
        {
            "status": 403,
            "jid": "participant2",
            "message": "not-authorized"
        }
    ]
}
```

### Update Group Settings

URL: https://wasenderapi.com/api-docs/groups/update-group-settings
Endpoint: PUT /api/groups/{groupJid}/settings
Description: Updates settings for a specific group (e.g., subject, description, announce mode, restrict mode). Requires admin privileges.

Details:
Update Group Settings

 Updates settings for a specific group (e.g., subject, description, announce mode, restrict mode). Requires admin privileges.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us. This is a unique identifier for the target WhatsApp group.
- subject (string, optional): The new name or title for the group. If provided, this will update the group's subject line that all members see.
- description (string, optional): The new text description for the group. This is the text that appears under the group name when viewing group info.
- announce (boolean, optional): Controls message sending permissions. Set subject `true` subject make the group 'announcement only', where only admins can send messages. Set subject `false` subject allow all participants subject send messages.
- restrict (boolean, optional): Controls who can edit the group's information (subject, description, and icon). Set subject `true` subject restrict editing subject admins only. Set subject `false` subject allow all participants subject edit the group info.
- joinApproval (boolean, optional): Manages how new members join the group. Set subject `true` subject enable join approval, which means an admin must approve any new person who tries subject join via a group link. Set subject `false` subject disable this, allowing anyone with the link subject join immediately without needing approval.
- memberAdd (boolean, optional): Determines who has the permission subject add new members subject the group. Set subject `true` subject allow *any* participant in the group subject add new members. Set subject `false` subject restrict this permission subject *admins only*, meaning only admins can add new members.
- profilePicUrl (string, optional): A publicly accessible URL to the new group profile picture

Code examples:
```bash
curl -X PUT "https://www.wasenderapi.com/api/groups/{groupJid}/settings"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "subject": "My New Group",
      "profilePicUrl": "https://example.com/sticker.webp"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/settings"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"subject": "My New Group", "profilePicUrl": "https: //example.com/sticker.webp"}
response = requests.put(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/settings", {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/ausubjectload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/settings';

try {
    $response = $client->put($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'subject' => 'My New Group',
            'profilePicUrl' => 'https://example.com/sticker.webp',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/settings')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}.subject_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/settings"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}`)
    req, err := http.NewRequest("PUT", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/settings");
        var request = new RestRequest(Method.PUT);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/settings"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("PUT", HttpRequest.BodyPublishers.ofString("{"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/settings")!
var request = URLRequest(url: url)
request.httpMethod = "PUT"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/settings"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "subject": "My New Group",
    "profilePicUrl": "https://example.com/sticker.webp"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'PUT',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/settings',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[subjectkio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/settings";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.PUT(url)
        .headers(headers)
        .json(&json!({"subject":"My New Group","profilePicUrl":"https://example.com/sticker.webp"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "subject": "New Group Subject",
        "description": "New Group Description"
    }
}
```

### Get Group Invite Link

URL: https://wasenderapi.com/api-docs/groups/get-group-invite-link
Endpoint: GET /api/groups/{groupJid}/invite-link
Description: This endpoint retrieves the invite link for a specific WhatsApp group.

Details:
Get Group Invite Link

 Retrieves the invite link for a specific WhatsApp group. This link can be shared with others to allow them to join the group.

 Only administrators of a group can generate an invite link. If the authenticated user is not an admin of the specified group, the request will fail.

 FAQ

 How do I find the groupJid?

 You can retrieve the groupJid for all groups the connected account is a member of by using the Get All Groups endpoint.

 Can any member of a group generate an invite link?

 No, only administrators of a group have the permission to generate an invite link.

Parameters:
- groupJid (string, required): The JID (Jabber ID) of the group in the format 123456789-987654321@g.us.

Code examples:
```bash
curl "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/{groupJid}/invite-link", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/{groupJid}/invite-link';

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/{groupJid}/invite-link')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/{groupJid}/invite-link");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
}
$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'GET',
      url: 'https://www.wasenderapi.com/api/groups/{groupJid}/invite-link',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/{groupJid}/invite-link";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);

    let client = reqwest::Client::new();
    let response = client.GET(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "inviteLink": "https://chat.whatsapp.com/I8mjkHnC984Ubg3EVkzqxz"
}
```

### Get Group Invite Info

URL: https://wasenderapi.com/api-docs/groups/get-group-invite-info
Endpoint: GET /api/groups/invite/{inviteCode}
Description: Retrieves metadata for a group from its invite code.

Details:
Get Group Invite Info

 This endpoint allows you to fetch public information and metadata about a WhatsApp group by using its invitation code, without actually joining the group. It's useful for previewing a group's subject, description, and size.

Parameters:
- inviteCode (string, required): The unique invitation code from the group invite link. For example, in the link https://chat.whatsapp.com/ABCDE12345, the code is ABCDE12345.

Code examples:
```bash
curl -X GET "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.get(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE", {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$inviteCode = 'SAMPLE_INVITE_CODE';
$url = 'https://www.wasenderapi.com/api/groups/invite/' . $inviteCode;

try {
    $response = $client->get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Get.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE");
        var request = new RestRequest(Method.GET);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE")!
var request = URLRequest(url: url)
request.httpMethod = "GET"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE"
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'get',
      url: 'https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/invite/SAMPLE_INVITE_CODE";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.get(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "id": "123456789-987654321@g.us",
        "subject": "Official Project Group",
        "owner": "1234567890@s.whatsapp.net",
        "creation": 1672531200,
        "size": 42,
        "desc": "This is the official group for project updates.",
        "participants": [
            { "id": "111111111@s.whatsapp.net", "admin": "superadmin" },
            { "id": "222222222@s.whatsapp.net", "admin": "admin" }
        ]
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "Failed to get group invite info: Invalid or expired invite code."
}
```

### Accept Group Invite

URL: https://wasenderapi.com/api-docs/groups/accept-group-invite
Endpoint: POST /api/groups/invite/accept
Description: Accept a group invitation using an invite code.

Details:
Accept Group Invite

 This endpoint allows the connected WhatsApp account to join a group using a specific invitation code. The code is typically part of a group invite link (e.g., https://chat.whatsapp.com/INVITE_CODE).

Parameters:
- code (string, required): The unique invitation code from the group invite link that you want to accept.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/groups/invite/accept"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "code": "SAMPLE_INVITE_CODE"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/invite/accept"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"code": "SAMPLE_INVITE_CODE"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/invite/accept", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"code":"SAMPLE_INVITE_CODE"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/groups/invite/accept';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' => [
            'code' => 'SAMPLE_INVITE_CODE',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/groups/invite/accept')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"code":"SAMPLE_INVITE_CODE"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/invite/accept"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"code":"SAMPLE_INVITE_CODE"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/invite/accept");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{"code":"SAMPLE_INVITE_CODE"}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/invite/accept"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"code\":\"SAMPLE_INVITE_CODE\"}"))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/invite/accept")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"code": "SAMPLE_INVITE_CODE"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/invite/accept"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "code": "SAMPLE_INVITE_CODE"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/groups/invite/accept',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"code":"SAMPLE_INVITE_CODE"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/invite/accept";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .json(&json!({"code":"SAMPLE_INVITE_CODE"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {
        "id": "123456789-987654321@g.us"
    }
}
```
Error Response:
```json
{
    "success": false,
    "error": "Failed to accept group invite: Invalid invite code"
}
```

### Leave Group

URL: https://wasenderapi.com/api-docs/groups/leave-group
Endpoint: POST /api/groups/{groupId}/leave
Description: Leave a specific group that the user is a member of.

Details:
Leave Group

 This endpoint allows the connected WhatsApp account to leave a specific group. The account must be a member of the group to successfully leave it.

Parameters:
- groupId (string, required): The JID (Jabber ID) of the group to leave, in the format 123456789-987654321@g.us.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave"
  -H "Authorization: Bearer YOUR_API_KEY"
```
```python
import requests

url = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.post(url, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$groupId = '123456789-987654321@g.us';
$url = 'https://www.wasenderapi.com/api/groups/' . $groupId . '/leave';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Accept' => 'application/json',
        ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'

uri = URI.parse('https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'

response = http.request(request)
puts response.body
```
```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave"
    apiKey := "YOUR_API_KEY"

    req, err := http.NewRequest("POST", url, nil)
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using RestSharp;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave");
        var request = new RestRequest(Method.POST);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data, let jsonString = String(data: data, encoding: .utf8) else {
        print("No data received")
        return
    }

    print(jsonString)
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave"
$headers = @{"Authorization" = "Bearer YOUR_API_KEY"}

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'post',
      url: 'https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/groups/123456789-987654321@g.us/leave";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}"), api_key))?);

    let client = reqwest::Client::new();
    let response = client.post(url)
        .headers(headers)
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
    "success": true,
    "data": {}
}
```
Error Response:
```json
{
    "success": false,
    "error": "Failed to leave group: You are not a member of this group."
}
```

### Send Channel Message

URL: https://wasenderapi.com/api-docs/channels-communities/send-channel-message
Endpoint: POST /api/send-message
Description: Sends a message to a specific WhatsApp channel using its Channel ID.

Details:
Send Message to a WhatsApp Channel

 To send a message to a WhatsApp Channel, follow these steps:

 -
 First, listen for the message.upsert event.
 This event will include the channel's unique ID (e.g., 123456789@newsletter) in the jid field.

 -
 Once you have the channel ID, use it in the to field when sending a message through your usual send endpoint.

 -
 The message parameters are the same as those for regular messages. Just ensure the to field is set to the channel's ID.

Parameters:
- to (string, required): Channel ID (e.g., '123456789@newsletter') .
- text (string, required): The text content of the message. Required if no media/contact/location is sent.
- imageUrl (string, optional): URL of the image to send.
- videoUrl (string, optional): URL of the video to send.
- documentUrl (string, optional): URL of the document to send.
- audioUrl (string, optional): URL of the audio file to send (sent as voice note).
- stickerUrl (string, optional): URL of the sticker (.webp) to send.
- contact (object, optional): Contact card object.
- location (object, optional): Location object.

Code examples:
```bash
curl -X POST "https://www.wasenderapi.com/api/send-message"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
      "to": "123456789@newsletter",
      "text": "Hello everyone in the channel!"
  }'
```
```python
import requests

url = "https://www.wasenderapi.com/api/send-message"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {"to": "123456789@newsletter", "text": "Hello everyone in the channel!"}
response = requests.post(url, json=data, headers=headers)
print(response.json())
```
```javascript
async function callApi() {
  const response = await fetch("https://www.wasenderapi.com/api/send-message", {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"to":"123456789@newsletter","text":"Hello everyone in the channel !"})
  });
  const result = await response.json();
  console.log(result);
}

callApi();
```
```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed

use GuzzleHttp\Client;

$client = new Client();
$apiKey = 'YOUR_API_KEY';
$url = 'https://www.wasenderapi.com/api/send-message';

try {
    $response = $client->post($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ],
        'json' =>             [
            'to' => '123456789@newsletter',
            'text' => 'Hello everyone in the channel!',
            ]
    ]);

    echo $response->getBody();
} catch (\GuzzleHttp\Exception\RequestException $e) {
    echo "Request failed: " . $e->getMessage();
    if ($e->hasResponse()) {
        echo "\nResponse: " . $e->getResponse()->getBody();
    }
}
```
```ruby
require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://www.wasenderapi.com/api/send-message')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true if uri.scheme == 'https'

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {"to":"123456789@newsletter","text":"Hello everyone in the channel!"}.to_json

response = http.request(request)
puts JSON.parse(response.body)
```
```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "https://www.wasenderapi.com/api/send-message"
    apiKey := "YOUR_API_KEY"

    payload := []byte(`{"to":"123456789@newsletter","text":"Hello everyone in the channel!"}`)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    if err != nil {
        panic(err)
    }

    req.Header.Add("Authorization", "Bearer " + apiKey)
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
```csharp
using System;
using System.Threading.Tasks;
using RestSharp;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new RestClient("https://www.wasenderapi.com/api/send-message");
        var request = new RestRequest(Method.Post);
        request.AddHeader("Authorization", "Bearer YOUR_API_KEY");
        request.AddHeader("Content-Type", "application/json");
        var body = @"{""to"":""123456789@newsletter"",""text"":""Hello everyone in the channel!""}";
        request.AddParameter("application/json", body, ParameterType.RequestBody);

        var response = await client.ExecuteAsync(request);
        Console.WriteLine(response.Content);
    }
}
```
```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://www.wasenderapi.com/api/send-message"))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .method("POST", HttpRequest.BodyPublishers.ofString("{\"to\":\"123456789@newsletter\",\"text\":\"Hello everyone in the channel!\"}"));

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}
```
```swift
import Foundation

let url = URL(string: "https://www.wasenderapi.com/api/send-message")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer YOUR_API_KEY", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body: [String: Any] = {"to":"123456789@newsletter","text":"Hello everyone in the channel!"}
let bodyData = try? JSONSerialization.data(withJSONObject: body, options: [])
request.httpBody = bodyData

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error)")
        return
    }

    guard let data = data else {
        print("No data received")
        return
    }

    if let jsonString = String(data: data, encoding: .utf8) {
        print(jsonString)
    }
}

task.resume()
```
```powershell
$uri = "https://www.wasenderapi.com/api/send-message"
$headers = @{
    "Authorization" = "Bearer YOUR_API_KEY"
    "Content-Type" = "application/json"
}
$body = @'
{
    "to": "123456789@newsletter",
    "text": "Hello everyone in the channel!"
}
'@

$response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```
```typescript
import axios from 'axios';

async function callApi() {
  try {
    const config = {
      method: 'POST',
      url: 'https://www.wasenderapi.com/api/send-message',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      data: {"to":"123456789@newsletter","text":"Hello everyone in the channel!"}
    };

    const response = await axios(config);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

callApi();
```
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://www.wasenderapi.com/api/send-message";
    let api_key = "YOUR_API_KEY";

    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", api_key))?);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let client = reqwest::Client::new();
    let response = client.POST(url)
        .headers(headers)
        .json(&json!({"to":"123456789@newsletter","text":"Hello everyone in the channel!"}))
        .send()
        .await?;

    let json_response = response.json::<serde_json::Value>().await?;
    println!("{:#?}", json_response);

    Ok(())
}
```

Response examples:
Success Response:
```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```

### Webhook Setup

URL: https://wasenderapi.com/api-docs/webhooks/webhook-setup
Endpoint: POST /your-webhook-url
Description: How to set up and verify webhooks to receive real-time events.

Details:
Webhook Setup

 Webhooks allow your application to receive real-time notifications about events happening in your WhatsApp session, such as receiving messages, message status updates, or session status changes.

 Configuration:

 - Go to your WhatsApp Session settings in the Wasender dashboard.

 - Enter your publicly accessible webhook URL in the 'Webhook URL' field. This URL must be HTTPS.

 - Optionally, generate and save a 'Webhook Secret'. This secret is used to verify that incoming requests are genuinely from Wasender.

 - Enable the specific events you want to subscribe to.

 - Save your changes.

 Verification:

 It's crucial to verify that incoming webhook requests originate from Wasender. Check if the X-Webhook-Signature header in the request matches your stored Webhook Secret.

 Always respond to webhook requests with a 200 OK status code quickly to acknowledge receipt, even if you process the event asynchronously.

Parameters:
- X-Webhook-Signature (string, required): Secret key used to verify the webhook came from WasenderApi.
- Content-Type (string, required): Should be `application/json`.

Code examples:
```javascript
// Example webhook endpoint in Express.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify webhook signature to ensure it's from WasenderApi
function verifySignature(req) {
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = 'YOUR_WEBHOOK_SECRET'; // Store securely
    if (!signature || !webhookSecret || signature !== webhookSecret) return false;
    return true;
}

app.post('/webhook', (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body;
    console.log('Received webhook event:', payload.event);

    // Handle different event types (e.g., message.sent, session.status)
    switch (payload.event) {
        case 'messages.upsert':
            console.log('New message received:', payload.data.key.id);
            // Process the incoming message
            break;
        // Add other cases
    }

    res.status(200).json({ received: true });
});

app.listen(3000, () => {
    console.log('Webhook server listening on port 3000');
});
```

### Webhook: Contact Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-contact-update
Description: Triggered for other contact updates, such as a contact changing their profile picture or status (if available).

Details:
Webhook: Contact Update

 Triggered for other contact updates, such as a contact changing their profile picture or status (if available).

Code examples:
```json
{
  "event": "contacts.update",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "1234567890",
      "imgUrl": "https://pps.whatsapp.net/v/t61.24694-24/123456789_123456789_123456789_123456789_123456789.jpg"
    }
  ]
}
```

### Webhook: Contact Upsert

URL: https://wasenderapi.com/api-docs/webhooks/webhook-contact-upsert
Description: Triggered when a new contact is added or an existing contact is updated in your session's contact list.

Details:
Webhook: Contact Upsert

 Triggered when a new contact is added or an existing contact is updated in your session's contact list.

Code examples:
```json
{
  "event": "contacts.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "1234567890",
      "name": "Contact Name",
      "notify": "Contact Display Name",
      "verifiedName": "Verified Business Name",
      "status": "Hey there! I am using WhatsApp."
    }
  ]
}
```

### Webhook: Group Participants Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-group-participants-update
Description: Triggered when participants are added, removed, promoted, or demoted in a group.

Details:
Webhook: Group Participants Update

 Triggered when participants are added, removed, promoted, or demoted in a group.

Code examples:
```json
{
  "event": "group-participants.update",
  "timestamp": 1633456789,
  "data": {
    "jid": "123456789-987654321@g.us",
    "participants": ["1234567890"],
    "action": "add" // or "remove", "promote", "demote"
  }
}
```

### Webhook: Group Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-group-update
Description: Triggered for other group-related updates, such as changes to group settings like announce mode or restrict mode by an admin.

Details:
Webhook: Group Update

 Triggered for other group-related updates, such as changes to group settings like announce mode or restrict mode by an admin.

Code examples:
```json
{
  "event": "groups.update",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "123456789-987654321@g.us",
      "announce": true,
      "restrict": false
    }
  ]
}
```

### Webhook: Chat Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-chat-update
Description: Triggered when properties of a chat are updated (e.g., unread count, mute status).

Details:
Webhook: Chat Update

 Triggered when properties of a chat are updated (e.g., unread count, mute status).

Code examples:
```json
{
  "event": "chats.update",
  "timestamp": 1633456789,
  "data": [
    {
      "id": "1234567890",
      "unreadCount": 0,
      "conversationTimestamp": 1633456789
    }
  ]
}
```

### Webhook: Group Upsert

URL: https://wasenderapi.com/api-docs/webhooks/webhook-group-upsert
Description: Triggered when your session joins a new group or when metadata of an existing group (subject, description, etc.) is updated.

Details:
Webhook: Group Upsert

 Triggered when your session joins a new group or when metadata of an existing group (subject, description, etc.) is updated.

Code examples:
```json
{
  "event": "groups.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "jid": "123456789-987654321@g.us",
      "subject": "Group Name",
      "creation": 1633456700,
      "owner": "1234567890",
      "desc": "Group description",
      "participants": [
        {
          "jid": "1234567890",
          "isAdmin": true,
          "isSuperAdmin": true
        },
        {
          "jid": "0987654321",
          "isAdmin": false,
          "isSuperAdmin": false
        }
      ]
    }
  ]
}
```

### Webhook: Message Sent

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-sent
Description: Event triggered when a message is successfully sent from your session.

Details:
Webhook Event: message.sent

 Triggered when a message is successfully sent from your session. The payload contains details about the sent message.

 See the code example below for the typical payload structure.

Code examples:
```json (message sent successfully)
{
  "event": "message.sent",
  "timestamp": 1633456790,
  "data": {
    "key": {
      "id": "message-id-456",
      "fromMe": true,
      "remoteJid": "+1987654321"
    },
    "message": {
      "conversation": "This is my reply."
    },
    "success": true
  }
}
```
```json (message failed to be sent)
{
  "event": "message.sent",
  "timestamp": 1633456790,
  "data": {
    "success": false,
    "error": "Failed to send message: Invalid number JID: +123456787"
  }
}
```

### Webhook: Chat Delete

URL: https://wasenderapi.com/api-docs/webhooks/webhook-chat-delete
Description: Triggered when a chat is deleted.

Details:
Webhook: Chat Delete

 Triggered when a chat is deleted.

Code examples:
```json
{
  "event": "chats.delete",
  "timestamp": 1633456789,
  "data": [
    "1234567890"
  ]
}
```

### Webhook: Chat Upsert

URL: https://wasenderapi.com/api-docs/webhooks/webhook-chat-upsert
Description: Triggered when a chat is created or updated (e.g., new message, read status change).

Details:
Webhook: Chat Upsert

 Triggered when a chat is created or updated (e.g., new message, read status change).

Code examples:
```json
{
  "event": "chats.upsert",
  "timestamp": 1633456789,
  "data": [
    {
      "id": "1234567890",
      "name": "Contact Name",
      "conversationTimestamp": 1633456789,
      "unreadCount": 2
    }
  ]
}
```

### Webhook: Session Status

URL: https://wasenderapi.com/api-docs/webhooks/webhook-session-status
Description: Event triggered when the connection status of your WhatsApp session changes, including QR and Passkey linking states.

Details:
Webhook Event: session.status

 Triggered when the connection status of your WhatsApp session changes. The payload includes the new status and the session ID.

 Status values

 Status
 Meaning
 Recommended action

 connected
 The WhatsApp session is connected and ready to send or receive messages.
 Start using the session API key for messaging.

 connecting
 The session is starting or reconnecting.
 Wait and continue polling or listening for the next webhook event.

 need_scan
 The session needs the user to scan a WhatsApp QR code.
 Show the QR linking UI or call the QR code endpoint to get a fresh QR code.

 need_passkey
 The session needs the user to approve a WhatsApp Passkey linking request.
 Fetch the Passkey token and ask the user to complete linking with Device Link Helper.

 disconnected
 The session is disconnected but may be reconnected.
 Offer the user a reconnect action.

 logged_out
 The WhatsApp account was logged out from the linked device.
 Ask the user to link the session again with QR or Passkey.

 expired
 The session expired or can no longer be resumed safely.
 Ask the user to reconnect the session.

 Passkey fallback: If Passkey linking cannot continue, the session may return to need_scan. In that case, show the normal QR linking flow.

 See the code example below for the typical payload structure.

Code examples:
```json
{
  "event": "session.status",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "status": "need_passkey"
  }
}
```

### Webhook: Passkey Updated

URL: https://wasenderapi.com/api-docs/webhooks/webhook-passkey-updated
Description: Event triggered when a WhatsApp Passkey linking request changes stage.

Details:
Webhook Event: passkey.updated

 Triggered when a WhatsApp Passkey linking request changes stage. This event is useful if your application wants to track Passkey linking progress in real time.

 Recommended API flow: Most API integrations should show the temporary Passkey token to the user and ask them to paste it into the Device Link Helper Chrome extension. The extension handles the WebAuthn approval and calls the advanced Passkey endpoints automatically.

 Payload format

 Webhook requests are sent as a JSON payload with the event name, session ID, data object, and timestamp.

 {
 "event": "passkey.updated",
 "sessionId": "YOUR_SESSION_API_KEY",
 "data": {
 "stage": "request",
 "requestId": "passkey-request-id",
 "token": "temporary-passkey-token",
 "expiresAt": 1783619400000
 },
 "timestamp": 1783619100000
}

 Passkey stages

 Stage
 Meaning
 Recommended action

 request
 A Passkey request was created. The payload includes the temporary token and request ID.
 Show the token to the user and ask them to paste it into Device Link Helper, or start your own helper flow.

 confirmation
 WhatsApp returned the continuation data and the request is ready to be confirmed.
 If you use Device Link Helper, no action is needed. If you built your own helper, call /api/passkey/confirm.

 fallback_qr
 The proactive Passkey flow did not finish in time and the session is switching back to QR linking.
 Stop the Passkey flow and show the QR linking UI. Watch for session.status with need_scan.

 no_continuation
 WhatsApp acknowledged the Passkey prologue but did not continue the linking flow.
 Ask the user to retry Passkey linking or use QR linking.

 Stage details

 The request stage can include:

 - requestId — ID of the Passkey request.

 - token — temporary token used by Device Link Helper or a custom helper.

 - expiresAt — expiration timestamp for the temporary token.

 The confirmation stage can include:

 - requestId — ID of the Passkey request.

 - code — internal confirmation value returned by WhatsApp. The website and helper do not show this code to the user.

 - skipHandoffUx — whether WhatsApp can skip part of the handoff UX.

 The fallback_qr and no_continuation stages can include:

 - requestId — ID of the Passkey request.

 - error — user-readable reason for the fallback or failure.

 Final connected state: This webhook tracks Passkey progress only. To know when the session is fully connected, listen for session.status with connected.

Code examples:
```json
{
  "event": "passkey.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "stage": "request",
    "requestId": "passkey-request-id",
    "token": "temporary-passkey-token",
    "expiresAt": 1783619400000
  },
  "timestamp": 1783619100000
}
```

Response examples:
Request Stage:
```json
{
  "event": "passkey.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "stage": "request",
    "requestId": "passkey-request-id",
    "token": "temporary-passkey-token",
    "expiresAt": 1783619400000
  },
  "timestamp": 1783619100000
}
```
Confirmation Stage:
```json
{
  "event": "passkey.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "stage": "confirmation",
    "requestId": "passkey-request-id",
    "code": "123456",
    "skipHandoffUx": false
  },
  "timestamp": 1783619160000
}
```
Fallback to QR:
```json
{
  "event": "passkey.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "stage": "fallback_qr",
    "requestId": "passkey-request-id",
    "error": "Passkey linking did not finish in time. Switching back to QR linking."
  },
  "timestamp": 1783619220000
}
```
No Continuation:
```json
{
  "event": "passkey.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "stage": "no_continuation",
    "requestId": "passkey-request-id",
    "error": "WhatsApp acknowledged the passkey prologue but did not continue."
  },
  "timestamp": 1783619220000
}
```

### Webhook: QR Code Updated

URL: https://wasenderapi.com/api-docs/webhooks/webhook-qrcode-updated
Description: Event triggered when a new QR code is generated for linking your session.

Details:
Webhook Event: qrcode.updated

 Triggered when a new QR code is generated for linking your session. The payload contains the QR code data.

 See the code example below for the typical payload structure.

Code examples:
```json
{
  "event": "qrcode.updated",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "qr": "2@67576ghf/RMXr8A2IP3/...", // This is the QR string. Use a QR code library to generate an image.
  }
}
```

### Webhook: Message Received

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-received
Description: Event is triggered for incoming messages, to listen for both incoming and outgoing, please refer to messages.upsert.

Details:
Webhook Event: messages.received
 This event is triggered when a new message is received in your session. The payload includes the message content, sender information, and message key.
 See the code example below for a typical payload structure.
 To learn more about handling media in this event, please refer to the help center article on handling media messages.

Code examples:
```json
{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": 
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "1234567890@s.whatsapp.net", // could also be 555555555@lid based on the addressingMode
          "addressingMode": "pn", 
          "senderPn": "1234567890@s.whatsapp.net",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}
```

### Webhook: Message Upsert

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-upsert
Description: Event is triggered for all messages in your session, both incoming and outgoing. To listen only for incoming events, please refer to messages.received.

Details:
Webhook Event: messages.upsert
 This event is triggered for all messages in your session, both incoming and outgoing. To listen only for incoming events, please refer to messages.received. The payload includes the message content, sender information, and message key.
 See the code example below for a typical payload structure.
 To learn more about handling media in this event, please refer to the help center article on handling media messages.

Code examples:
```json
{
  "event": "messages.upsert",
  "timestamp": 1633456789,
  "data": {
    "messages": [
      {
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          // This can be a LID (e.g., "123456@lid") depending on the addressing mode.
          "remoteJid": "5551234567@s.whatsapp.net", 
          // Use these fields for phone number logic:
          "senderPn": "5551234567@s.whatsapp.net",
          "cleanedSenderPn": "5551234567",
          // This will match remoteJid if remoteJid is already an LID
          "senderLid": "123456789@lid",
          "addressingMode": "pn"
        },
        "messageBody": "Hello!",
        "message": {
          "conversation": "Hello!"
        }
      }
    ]
  }
}
```

### Webhook: Group Message Received

URL: https://wasenderapi.com/api-docs/webhooks/webhook-group-message-received
Description: Event is triggered when a message is received in any group the session is a part of.

Details:
Webhook Event: messages-group.received

 This event is triggered whenever a new message is received in a group that your session is a member of. The payload is similar to a direct message but critically includes the remoteJid of the group and the participant JID of the actual sender.

 The payload includes the message content, the group's JID, the sender's JID, and the message key.

 To learn more about handling media in this event, please refer to the help center article on handling media messages.

Code examples:
```json
{
  "event": "messages-group.received",
  "timestamp": 1633456799,
  "data": {
    "messages":
      {
        "key": {
          "id": "message-id-group-456",
          "fromMe": false,
          "remoteJid": "123456789-987654321@g.us",
          "participant": "123456789@lid",
          "participantPn": "123456789@s.whatsapp.net",
          "cleanedParticipantPn": "123456789",
          "participantLid": "123456789@lid", 
          "addressingMode": "lid"
        },
        "messageBody": "Hey everyone, just checking in!",
        "message": {
          "conversation": "Hey everyone, just checking in!"
        }
      }
  }
}
```

### Webhook: Message Status Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-update
Description: Event triggered when a message's status is updated (e.g., delivered, read).

Details:
Webhook Event: messages.update

 Triggered when a message's status is updated (e.g., delivered, read). The payload contains the updated status and message key.

 See the code example below for the typical payload structure.

 Status Codes

 Status Code
 Description
 Explanation

 0
 ERROR
 The message failed to send due to an error.

 1
 PENDING
 The message is queued and waiting to be sent.

 2
 SENT
 The message has been sent from the server but not yet delivered.

 3
 DELIVERED
 The message has reached the recipient’s device.

 4
 READ
 The recipient has opened and read the message.

 5
 PLAYED
 The recipient has played the media message (e.g., audio or video).

Code examples:
```json
{
  "event": "messages.update",
  "sessionId": "your_api_key",
  "data": {
    "update": {
      "status": 2
    },
    "key": {
      "remoteJid": "123456789@s.whatsapp.net",
      "id": "34874643876",
      "fromMe": false
    }
  },
  "timestamp": 1747775431467
}
```

### Webhook: Message Deleted

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-deleted
Description: Event triggered when a message is deleted.

Details:
Webhook Event: messages.delete

 Triggered when a message is deleted. The payload contains the key of the deleted message.

 See the code example below for the typical payload structure.

Code examples:
```json
{
  "event": "messages.delete",
  "timestamp": 1633456800,
  "data": {
    "keys": [
      {
        "id": "message-id-789",
        "fromMe": false,
        "remoteJid": "+1234567890"
      }
    ]
  }
}
```

### Webhook: Newsletter Message Received

URL: https://wasenderapi.com/api-docs/webhooks/webhook-newsletter-message-received
Description: Event is triggered when a message is received in a newsletter (channel) the session is subscribed to.

Details:
Webhook Event: messages-newsletter.received

 This event is triggered when a new message is published in a newsletter (also known as a Channel) that your session is subscribed to.

 The payload includes the message content and the unique JID of the newsletter, which typically ends in @newsletter. Unlike group messages, a participant field is not needed as the sender is the newsletter itself.

 See the code example below for a typical payload structure.

Code examples:
```json
{
  "event": "messages-newsletter.received",
  "timestamp": 1633456799,
  "data": {
    "messages": 
      {
        "key": {
          "id": "message-id-newsletter-456",
          "fromMe": false,
          "remoteJid": "123456789-987654321@newsletter",
        },
        "messageBody": "Hey Good News!",
        "message": {
          "conversation": "Hey Good News!"
        }
      }
  }
}
```

### Webhook: Message Receipt Update

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-receipt-update
Description: Event triggered specifically for message receipt status changes.

Details:
Webhook Event: message-receipt.update

 This event is triggered specifically for message receipt status updates within group chats, such as sent, delivered, or read by individual group members. The payload includes the updated receipt status and the message key identifying the message.

 See the code example below for a typical payload structure.

Code examples:
```json ( receipt )
{
  "event": "message-receipt.update",
  "sessionId": "your_session_id_here",
  "data": {
    "message": {
      "key": {
        "remoteJid": "group_jid_here@g.us",
        "id": "message_id_here",
        "fromMe": true,
        "participant": "participant_jid_here"
      },
      "receipt": {
        "userJid": "participant_jid_here",
        "receiptTimestamp": 1234567890
      }
    }
  },
  "timestamp": 1234567890123
}
```
```json ( read )
{
  "event": "message-receipt.update",
  "sessionId": "your_session_id_here",
  "data": {
    "message": {
      "key": {
        "remoteJid": "group_jid_here@g.us",
        "id": "message_id_here",
        "fromMe": true,
        "participant": "participant_jid_here"
      },
      "receipt": {
        "userJid": "participant_jid_here",
        "readTimestamp": 1234567890
      }
    }
  },
  "timestamp": 1234567890123
}
```

### Webhook: Personal Message Received

URL: https://wasenderapi.com/api-docs/webhooks/webhook-personal-message-received
Description: Event is triggered when a message is received in a personal (one-to-one) chat.

Details:
Webhook Event: messages-personal.received

 This event is triggered when a new message is received in a direct, one-to-one conversation with a contact.

 The payload includes the message content and the sender's JID in the remoteJid field. This event is distinct from group or newsletter messages.

 To learn more about handling media in this event, please refer to the help center article on handling media messages.

Code examples:
```json
{
  "event": "messages-personal.received",
  "timestamp": 1633456789,
  "data": {
    "messages":
      {
        "key": {
          "id": "3EB0X123456789",
          "fromMe": false,
          "remoteJid": "1234567890@s.whatsapp.net",
          "addressingMode": "pn", 
          "senderPn": "1234567890@s.whatsapp.net",
          "cleanedSenderPn": "1234567890",
          "senderLid": "555555555@lid"
        },
        "messageBody": "Hello, I have a question",
        "message": {
          "conversation": "Hello, I have a question"
        }
      }
  }
}
```

### Webhook: Call Received

URL: https://wasenderapi.com/api-docs/webhooks/webhook-call-received
Description: Event is triggered for an incoming voice or video call.

Details:
Webhook Event: call

 This event is triggered whenever an incoming voice or video call is received by the session.

 The payload contains the full call object, which includes a unique call ID (required for rejecting the call), the caller's JID, and other call metadata like whether it is a video call.

 This event is particularly useful for building features like automatic call rejection or logging all incoming call attempts.

Code examples:
```json
{
  "event": "call",
  "timestamp": 1633456829,
  "data": {
    "call": {
      "id": "3EB025832E521B2F7E11",
      "from": "1234567890@s.whatsapp.net",
      "date": "2025-09-22T21:34:00.000Z",
      "isGroup": false,
      "isVideo": true,
      "status": "offer"
    }
  }
}
```

### Webhook: Message Reaction

URL: https://wasenderapi.com/api-docs/webhooks/webhook-message-reaction
Description: Event triggered when someone reacts to a message.

Details:
Webhook Event: messages.reaction

 Triggered when someone reacts to a message. The payload includes the reaction details and the message key.

 See the code example below for the typical payload structure.

Code examples:
```json
{
  "event": "messages.reaction",
  "timestamp": 1633456810,
  "data": [
    {
      "key": {
        "id": "message-id-123",
        "fromMe": false,
        "remoteJid": "+1234567890"
      },
      "reaction": {
        "text": "👍", // The emoji reaction
        "key": {
          "id": "message-id-123",
          "fromMe": false,
          "remoteJid": "+1234567890"
        }
      }
    }
  ]
}
```

### Webhook: Poll Results

URL: https://wasenderapi.com/api-docs/webhooks/webhook-poll-results
Description: This webhook is triggered when there is an update to a poll, such as when a user casts a vote.

Details:
Webhook: Poll Results

 Triggered when a user votes in a poll that was created using the Send Poll Message API endpoint. This webhook provides updates on the poll's results as votes are cast.

Code examples:
```json
{
  "event": "poll.results",
  "sessionId": "YOUR_SESSION_API_KEY",
  "data": {
    "key": {
      "remoteJid": "123456789@s.whatsapp.net",
      "fromMe": true,
      "id": "FZNABLUGNI0F3QIJSWPW7H"
    },
    "pollResult": [
      {
        "name": "Pizza",
        "voters": [
          "123456789@s.whatsapp.net"
    ]
      },
      {
        "name": "Humberger",
        "voters": []
      }
    ]
  },
  "timestamp": 1753278982097
}
```

### Response Headers

URL: https://wasenderapi.com/api-docs/responses-errors/response-headers
Description: Information about standard headers included in API responses, particularly rate limiting.

Details:
Response Headers

 API responses include standard HTTP headers. Some important headers, especially related to rate limiting, are:

 - Content-Type: Typically application/json.

 - X-RateLimit-Limit: Max requests per window.

 - X-RateLimit-Remaining: Remaining requests in window.

 - X-RateLimit-Reset: Timestamp (seconds) when the window resets.

Parameters:
- X-RateLimit-Limit (integer, optional): The maximum number of requests allowed per time window.
- X-RateLimit-Remaining (integer, optional): The number of requests remaining in the current time window.
- X-RateLimit-Reset (integer, optional): The time in seconds until the rate limit resets.
- Content-Type (string, optional): Usually `application/json`.

### Error Responses

URL: https://wasenderapi.com/api-docs/responses-errors/error-responses
Description: Common error responses returned by the API.

Details:
Error Responses

 If an API request fails, the response will contain an error message and a relevant HTTP status code. Common error scenarios are listed below.

 The error response body typically follows this structure:

 {
 "message": "Error description",
 "errors": { // Optional: More specific field errors
 "field_name": ["Error details"]
 }
}

Response examples:
Validation Error:
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "to": [
            "The to field is required."
        ],
        "text": [
            "The text field is required when no media is present."
        ]
    }
}
```
Authentication Error:
```json
{
  "success": false,
  "message": "Invalid API key"
}
```
No Active Subscription Error:
```json
{
  "success": false,
  "message": "Active subscription or trial is required to use the API"
}
```
Trial Bulk Limit Error:
```json
{
  "success": false,
  "message": "You are on a trial plan and cannot send bulk message to more than 3 recipients."
}
```
Rate Limit Error (Trial):
```json
{
  "message": "You are on a free trial. You can only send 1 message every 1 minute.",
  "retry_after": 60
}
```
Rate Limit Error (Account Protection):
```json
{
  "message": "You have account protection enabled. You can only send 1 message every 5 seconds. Check our API docs: https://www.wasenderapi.com/api-docs",
  "retry_after": 5
}
```
Session is not Connected:
```json
{
    "success": false,
    "message": "Your Whatsapp Session is not connected please connect your session first."
}
```

### Understanding Rate Limits

URL: https://wasenderapi.com/api-docs/rate-limits/understanding-rate-limits
Description: Details on the rate limits applied to API requests based on subscription plans.

Details:
Understanding Rate Limits

 WasenderAPI applies rate limits to keep the platform stable, ensure fair usage, and reduce the risk of WhatsApp
 restrictions or bans. Limits depend on the endpoint, your plan, and whether account protection is enabled.

 Quick Summary

 Area
 Trial
 Paid Plans

 Send Message
 1 request / minute
50 requests / day
 256 requests / minute
No daily send-message cap

 Group participants / metadata
 10 requests / minute
100 requests / day
 10 requests / minute
500 requests / day

 Contact picture
 10 requests / minute
100 requests / day
 60 requests / minute
1,000 requests / day

 Check if a number is on WhatsApp
 10 requests / minute
100 requests / day
 60 requests / minute
1,000 requests / day

 Account Protection
 Trial send-message limits still apply
 1 send-message request / 5 seconds

 Important: Limits are enforced per endpoint per session. Different endpoints have different
 thresholds because some WhatsApp actions are riskier than others.

 Message Sending Limits

 The Send Message endpoint has stricter trial limits because it is the highest-risk endpoint for
 free-account abuse and WhatsApp number safety.

 Plan / Setting
 Rate Limit
 Daily Cap
 Why

 Trial Plan
 1 request / minute
 50 requests / day
 Allows safe testing while preventing free-account spam.

 Paid Plans
(Basic, Pro, Plus, Business)
 256 requests / minute
 No daily send-message cap
 Supports high-throughput messaging while protecting the platform from traffic spikes.

 Account Protection Enabled
(Paid plans)
 1 request / 5 seconds
 No daily send-message cap

 Safety-first mode that reduces WhatsApp flag or ban risk.
 This overrides the normal paid send-message limit.

 Utility Endpoint Limits

 Utility endpoints are less restricted than trial message sending, but they are still limited because excessive
 lookups, contact picture requests, and group scraping can look suspicious to WhatsApp.

 Endpoint / Action
 Trial Limit
 Paid Plan Limit
 Risk Notes

 Get group participants / metadata
 10 requests / minute
100 requests / day
 10 requests / minute
500 requests / day

 High-risk endpoint. WhatsApp monitors group scraping heavily. Call once per group and cache
 the result.

 Get contact picture
 10 requests / minute
100 requests / day
 60 requests / minute
1,000 requests / day
 Use only when necessary. Excessive usage may trigger WhatsApp anti-abuse systems.

 Check if a number is on WhatsApp
 10 requests / minute
100 requests / day
 60 requests / minute
1,000 requests / day

 High-risk endpoint. Avoid automated or bulk usage. Repeated calls may affect both number
 checks and contact picture requests.

 Concurrent Request Limits

 In addition to per-minute and daily limits, WasenderAPI enforces a global concurrent request limit per session.
 This controls how many requests can be processed at the same time.

 Scope
 Limit Type
 Purpose

 All endpoints per session
 Concurrent request cap

 Prevents excessive parallel requests that may trigger WhatsApp anti-abuse systems, even if minute limits are
 respected.

 How Concurrent Limits Work

 - The limit applies globally across all endpoints.

 - It is enforced per WhatsApp session.

 - If too many requests are sent at the same time, additional requests may be rejected temporarily.

 - This protection applies regardless of your plan.

 High concurrency is one of the most common causes of WhatsApp number bans. We strongly recommend using a queue
 system with controlled parallelism, such as 1 to 5 concurrent workers per session.

 Rate Limit Headers

 Rate-limited API responses include headers to help you monitor usage:

 - X-RateLimit-Limit — maximum requests allowed in the current window.

 - X-RateLimit-Remaining — remaining requests before the limit is reached.

 - X-RateLimit-Reset — seconds until the current window resets.

 Endpoints with daily caps may also include:

 - X-RateLimit-Daily-Limit — maximum requests allowed for the day.

 - X-RateLimit-Daily-Remaining — remaining requests before the daily cap is reached.

 - X-RateLimit-Daily-Reset — seconds until the daily cap resets.

 Repeatedly hitting rate limits, or repeatedly triggering high-risk endpoints, may result in a temporary
 restriction of your API access while your usage is reviewed.

Parameters:
- X-RateLimit-Limit (integer, optional): The maximum number of requests allowed per time window.
- X-RateLimit-Remaining (integer, optional): The number of requests remaining in the current time window.
- X-RateLimit-Reset (integer, optional): The time in seconds until the rate limit resets.

Response examples:
Rate Limit Error (Trial):
```json
{
  "message": "You are on a free trial. You can only send 1 message every 1 minute.",
  "retry_after": 60
}
```
Rate Limit Error (Account Protection):
```json
{
  "message": "You have account protection enabled. You can only send 1 message every 5 seconds.",
  "retry_after": 5
}
```

## Optional

- [llms.txt proposal](https://llmstxt.org/index.md): Format reference used for this LLM-friendly documentation file.
