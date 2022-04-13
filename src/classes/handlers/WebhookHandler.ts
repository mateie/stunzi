import Client from '@classes/Client';
import Ascii from 'ascii-table';

export default class WebhookHandler {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async load() {
        const table = new Ascii('Webhooks Loaded').setHeading('Name', 'Status');

        const webhooks = await this.client.mainGuild.fetchWebhooks();

        webhooks.forEach(webhook => {
            this.client.webhooks.set(webhook.id, webhook);
            return table.addRow(webhook.name, '✔ Loaded');
        });
        
        console.log(table.toString());
    }
}