import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';

export default class UncaughtExceptionEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'uncaughtException';
        this.process = true;
    }

    async run(reason: Error, origin: string) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('There was an Uncaught Exception/Catch')
            .setColor('RED')
            .setURL('https://nodejs.org/api/process.html#event-uncaughtexception')
            .addField('Error', `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``.substring(0, 1000))
            .addField('Origin', `\`\`\`${inspect(origin, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        webhook?.send({ embeds: [embed] });
    }
}