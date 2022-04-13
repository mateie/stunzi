import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';

export default class WarnEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'warn';
        this.process = true;
    }

    async run(warn: Error) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('There was an Uncaught Exception Monitor Warning')
            .setColor('RED')
            .setURL('https://nodejs.org/api/process.html#event-warning')
            .addField('Warn', `\`\`\`${inspect(warn, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        webhook?.send({ embeds: [embed] });
    }
}