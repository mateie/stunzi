import Client from '@classes/Client';
import Event from '@classes/Event';
import webhooks from '@data/webhooks';
import IEvent from '@interfaces/IEvent';
import { inspect } from 'util';


export default class DiscordErrorEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'error';
    }

    async run(err: Error) {
        const webhook = this.client.webhooks.get(webhooks.errors);

        const embed = this.client.util.embed()
            .setTitle('Error')
            .setURL('https://discordjs.guide/popular-topics/errors.html#api-errors')
            .setColor('RED')
            .setDescription(`\`\`\`${inspect(err, { depth: 0 })}\`\`\``);
        
        webhook?.send({ embeds: [embed] });
    }
}