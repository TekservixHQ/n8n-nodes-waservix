# n8n-nodes-waservix

[![npm](https://img.shields.io/npm/v/n8n-nodes-waservix.svg)](https://www.npmjs.com/package/n8n-nodes-waservix)

**WAservix WhatsApp API Gateway** - official n8n community nodes: send WhatsApp messages from your own number, triggers on incoming messages and status updates.

n8n community nodes for [WAservix](https://tekservix.com/waservix/), the WhatsApp API gateway that sends from your own number.

WAservix links your WhatsApp number by QR code (the same way WhatsApp Web does). These nodes send text, images, documents and locations from any workflow, and start workflows when the number receives a message or a message status changes.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Trigger](#trigger) · [Examples](#example-workflows)

## Installation

In n8n, go to **Settings → Community Nodes → Install**, enter `n8n-nodes-waservix` and confirm. See the [n8n community nodes guide](https://docs.n8n.io/integrations/community-nodes/installation/) for self-hosted setups.

## Credentials

1. In the WAservix dashboard, add your number under **Devices** and scan the QR code with WhatsApp.
2. Copy the number's **API key** (and, for the trigger, its **webhook secret**).
3. In n8n, create a **WAservix API** credential and paste them. n8n tests the key against your number's status.

## Operations

| Resource | Operations |
|---|---|
| Message | **Send Text**, **Send Image**, **Send Document**, **Send Location** (to a number or a group JID), **Get Status** (queued, sent, delivered, read, played, failed), **Edit**, **Delete**, **Resend** |
| Number | **Check** whether a number has WhatsApp, **Get Connection Status** of your number |
| Contact | **Get**, **Get Many** |
| Group | **Get** (name, participants, settings), **Get Many** |

The WAservix node can also be used as a **tool by n8n AI agents**, so an agent can reply to customers on WhatsApp.

## Trigger

**WAservix Trigger** gives you a webhook URL. Paste the **Production URL** into the WAservix dashboard (Devices → your number → Webhook) and pick the events to send. In the node you can limit the workflow to certain events, for example:

- Message Received (any, personal or group)
- Message Sent, Message Status Update, Read Receipt
- Message Reaction, Message Deleted
- Call Received, Session Status

If you add the webhook secret to the credential, requests without the matching `X-Webhook-Signature` are rejected.

## Example workflows

- **WhatsApp auto-reply / AI agent:** WAservix Trigger (*Personal Message Received*) → AI Agent → WAservix *Send Text*
- **Invoice by WhatsApp:** Stripe / QuickBooks trigger → WAservix *Send Document*
- **Order updates:** WooCommerce trigger → WAservix *Send Text*
- **Lead capture:** WAservix Trigger → HubSpot / Google Sheets
- **Disconnection alert:** WAservix Trigger (*Session Status*) → email

## Use it responsibly

WAservix is not Meta's official WhatsApp Business Platform. There's no business verification and no per-conversation fee, but WhatsApp's spam rules apply to your number directly. Message people who expect to hear from you, warm up new numbers slowly and keep the built-in account protection on.

## Compatibility

Built with the official n8n node starter (Nodes API version 1). Works with current n8n versions, self-hosted or n8n Cloud once verified.

## Resources

- [WAservix API reference](https://tekservix.com/waservix/docs/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## More from Tekservix

- [SMS Gora SMS Gateway](https://tekservix.com/smsgora/): SMS through your own Android phones, also on n8n (`n8n-nodes-smsgora`)
- [AI Sales Agent](https://tekservix.com/ai-sales-agent): answers customers on WhatsApp and SMS using your website's content
- [Website to App](https://tekservix.com/mobile-apps): turn your website into Android and iOS apps
- WAservix client libraries for 12 languages: [github.com/TekservixHQ](https://github.com/TekservixHQ)

## License

MIT
