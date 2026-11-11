import {
	NodeConnectionTypes,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

// Every WAservix answer is { success, data }. Hand n8n the data part.
const dataOnly = {
	output: {
		postReceive: [{ type: 'rootProperty' as const, properties: { property: 'data' } }],
	},
};

const sendOps = ['sendDocument', 'sendImage', 'sendLocation', 'sendText'];

const show = (resource: string, operation: string[]) => ({
	show: { resource: [resource], operation },
});

const messageFields: INodeProperties[] = [
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: '+15551234567',
		description: 'Phone number in international format, or a group JID ending in @g.us',
		displayOptions: show('message', sendOps),
		routing: { send: { type: 'body', property: 'to' } },
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: show('message', ['sendText', 'edit']),
		routing: { send: { type: 'body', property: 'text' } },
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/product.jpg',
		displayOptions: show('message', ['sendImage']),
		routing: { send: { type: 'body', property: 'imageUrl' } },
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/invoice.pdf',
		displayOptions: show('message', ['sendDocument']),
		routing: { send: { type: 'body', property: 'documentUrl' } },
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		placeholder: 'Invoice-1042.pdf',
		displayOptions: show('message', ['sendDocument']),
		routing: { send: { type: 'body', property: 'fileName', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		default: '',
		displayOptions: show('message', ['sendImage', 'sendDocument']),
		routing: { send: { type: 'body', property: 'text', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'number',
		typeOptions: { numberPrecision: 6 },
		default: 0,
		required: true,
		displayOptions: show('message', ['sendLocation']),
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'number',
		typeOptions: { numberPrecision: 6 },
		default: 0,
		required: true,
		displayOptions: show('message', ['sendLocation']),
	},
	{
		displayName: 'Location Name',
		name: 'locationName',
		type: 'string',
		default: '',
		displayOptions: show('message', ['sendLocation']),
		routing: {
			send: {
				type: 'body',
				property: 'location',
				value:
					'={{ Object.assign({ latitude: $parameter.latitude, longitude: $parameter.longitude }, $value ? { name: $value } : {}) }}',
			},
		},
	},
	{
		displayName: 'Message ID',
		name: 'msgId',
		type: 'string',
		default: '',
		required: true,
		description: 'The msgId returned when the message was sent',
		displayOptions: show('message', ['delete', 'edit', 'get', 'resend']),
	},
];

const numberFields: INodeProperties[] = [
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '+15551234567',
		displayOptions: show('number', ['check']),
	},
];

const contactFields: INodeProperties[] = [
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '+15551234567',
		displayOptions: show('contact', ['get']),
	},
];

const groupFields: INodeProperties[] = [
	{
		displayName: 'Group JID',
		name: 'groupJid',
		type: 'string',
		default: '',
		required: true,
		placeholder: '120363040000000000@g.us',
		displayOptions: show('group', ['get']),
	},
];

export class Waservix implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAservix',
		name: 'waservix',
		icon: { light: 'file:../../icons/waservix.svg', dark: 'file:../../icons/waservix.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Send WhatsApp messages from your own number with the WAservix WhatsApp API gateway',
		defaults: { name: 'WAservix' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'waservixApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Group', value: 'group' },
					{ name: 'Message', value: 'message' },
					{ name: 'Number', value: 'number' },
				],
				default: 'message',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a message',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/messages/{{encodeURIComponent($parameter.msgId)}}',
							},
							...dataOnly,
						},
					},
					{
						name: 'Edit',
						value: 'edit',
						action: 'Edit a sent text message',
						description: 'Edit one of your own text messages (about 15 minutes after sending)',
						routing: {
							request: {
								method: 'PUT',
								url: '=/messages/{{encodeURIComponent($parameter.msgId)}}',
							},
							...dataOnly,
						},
					},
					{
						name: 'Get Status',
						value: 'get',
						action: 'Get the status of a message',
						description: 'Queued, sent, delivered, read, played or failed',
						routing: {
							request: {
								method: 'GET',
								url: '=/messages/{{encodeURIComponent($parameter.msgId)}}/info',
							},
							...dataOnly,
						},
					},
					{
						name: 'Resend',
						value: 'resend',
						action: 'Resend a failed message',
						routing: {
							request: {
								method: 'POST',
								url: '=/messages/{{encodeURIComponent($parameter.msgId)}}/resend',
							},
							...dataOnly,
						},
					},
					{
						name: 'Send Document',
						value: 'sendDocument',
						action: 'Send a document',
						routing: { request: { method: 'POST', url: '/send-message' }, ...dataOnly },
					},
					{
						name: 'Send Image',
						value: 'sendImage',
						action: 'Send an image',
						routing: { request: { method: 'POST', url: '/send-message' }, ...dataOnly },
					},
					{
						name: 'Send Location',
						value: 'sendLocation',
						action: 'Send a location',
						routing: { request: { method: 'POST', url: '/send-message' }, ...dataOnly },
					},
					{
						name: 'Send Text',
						value: 'sendText',
						action: 'Send a text message',
						routing: { request: { method: 'POST', url: '/send-message' }, ...dataOnly },
					},
				],
				default: 'sendText',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['number'] } },
				options: [
					{
						name: 'Check',
						value: 'check',
						description: 'Check whether a phone number has a WhatsApp account',
						action: 'Check if a number is registered',
						routing: {
							request: {
								method: 'GET',
								url: '=/on-whatsapp/{{encodeURIComponent($parameter.phone)}}',
							},
							...dataOnly,
						},
					},
					{
						name: 'Get Connection Status',
						value: 'status',
						action: 'Get the connection status of your number',
						description: 'Connected, connecting, need_scan, disconnected, logged_out or expired',
						routing: { request: { method: 'GET', url: '/status' }, ...dataOnly },
					},
				],
				default: 'check',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get a contact',
						routing: {
							request: {
								method: 'GET',
								url: '=/contacts/{{encodeURIComponent($parameter.phone)}}',
							},
							...dataOnly,
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many contacts',
						routing: { request: { method: 'GET', url: '/contacts' }, ...dataOnly },
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['group'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get a group',
						description: 'Group name, participants and settings',
						routing: {
							request: {
								method: 'GET',
								url: '=/groups/{{$parameter.groupJid.trim()}}/metadata',
							},
							...dataOnly,
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many groups',
						routing: { request: { method: 'GET', url: '/groups' }, ...dataOnly },
					},
				],
				default: 'getAll',
			},
			...messageFields,
			...numberFields,
			...contactFields,
			...groupFields,
		],
	};
}
