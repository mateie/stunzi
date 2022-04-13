import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';

export default class MultipleResolvesEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'multipleResolves';
        this.process = true;
    }

    async run(type: string, promise: Promise<any>, reason: any) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('**🟥 There was an Multiple Resolve 🟥**')
            .setURL('https://nodejs.org/api/process.html#event-multipleresolves')
            .setColor('RED')
            .addField('Type', `\`\`\`${inspect(type, { depth: 0 })}\`\`\``.substring(0, 1000))
            .addField('Promise', `\`\`\`${inspect(promise, { depth: 0 })}\`\`\``.substring(0, 1000))
            .addField('Reason', `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``.substring(0, 1000));
        
        webhook?.send({ embeds: [embed] });
    }
}