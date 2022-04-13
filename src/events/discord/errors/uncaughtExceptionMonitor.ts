import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';

export default class UncaughtExceptionMonitorEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'uncaughtExceptionMonitor';
        this.process = true;
    }

    async run(err: Error, origin: string) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('There was an Uncaught Exception Monitor')
            .setColor('RED')
            .setURL('https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor')
            .addField('Error', `\`\`\`${inspect(err, { depth: 0 })}\`\`\``.substring(0, 1000))
            .addField('Origin', `\`\`\`${inspect(origin, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        webhook?.send({ embeds: [embed] });
    }
}