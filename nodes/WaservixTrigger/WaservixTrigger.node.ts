import { timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

export class WaservixTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAservix Trigger',
		name: 'waservixTrigger',
		icon: { light: 'file:../../icons/waservix.svg', dark: 'file:../../icons/waservix.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle:
			'={{ ($parameter["events"] || []).length ? $parameter["events"].join(", ") : "All events" }}',
		description:
			'Starts the workflow when your WhatsApp number receives a message, a message status changes or the connection changes',
		defaults: { name: 'WAservix Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'waservixApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'Copy the Production URL above into the WAservix dashboard (Devices → your number → Webhook) and choose the events to send there.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: [],
				description: 'Only start the workflow for these events. Leave empty for all events.',
				options: [
					{ name: 'Call Received', value: 'call.received' },
					{ name: 'Group Message Received', value: 'messages-group.received' },
					{ name: 'Message Deleted', value: 'messages.deleted' },
					{ name: 'Message Reaction', value: 'messages.reaction' },
					{ name: 'Message Received (Any)', value: 'messages.received' },
					{ name: 'Message Sent', value: 'message.sent' },
					{ name: 'Message Status Update', value: 'messages.update' },
					{ name: 'Personal Message Received', value: 'messages-personal.received' },
					{ name: 'Read Receipt', value: 'message-receipt.update' },
					{ name: 'Session Status', value: 'session.status' },
				],
			},
		],
	};

	// WAservix webhooks are set per number in the dashboard (the API key used here cannot
	// change them), so there is nothing to register: the user pastes the URL shown above.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const credentials = await this.getCredentials('waservixApi');
		const secret = String(credentials.webhookSecret ?? '');

		// X-Webhook-Signature carries the number's webhook secret. Reject anything else.
		if (secret) {
			const signature = String(this.getHeaderData()['x-webhook-signature'] ?? '');
			const a = Buffer.from(signature);
			const b = Buffer.from(secret);
			if (a.length !== b.length || !timingSafeEqual(a, b)) {
				this.getResponseObject().status(401).send('Invalid signature');
				return { noWebhookResponse: true };
			}
		}

		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];
		if (events.length && !events.includes(String(body.event ?? ''))) {
			return { webhookResponse: 'ignored' };
		}

		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
