import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WAservixApi implements ICredentialType {
	name = 'waservixApi';

	displayName = 'WAservix API';

	icon: Icon = { light: 'file:../icons/waservix.svg', dark: 'file:../icons/waservix.dark.svg' };

	documentationUrl = 'https://tekservix.com/waservix/docs/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The API key of your WhatsApp number, from the WAservix dashboard under Devices',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Optional. The webhook secret of the same number, used by the WAservix Trigger to reject requests that did not come from WAservix.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://tekservix.com/waservix/api',
			description: 'Leave as is unless Tekservix support tells you otherwise',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/status',
			method: 'GET',
		},
	};
}
