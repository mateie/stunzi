import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';

export default class UnhandledRejectionEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'unhandledRejection';
        this.process = true;
    }

    async run(reason: Error, p: Promise<any> ) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('There was an Unhandled Rejection/Catch')
            .setURL('https://nodejs.org/api/process.html#event-unhandledrejection')
            .setColor('RED')
            .addField('Reason', `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``.substring(0, 1000))
            .addField('Promise', `\`\`\`${inspect(p, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        webhook?.send({ embeds: [embed] });
    }
}