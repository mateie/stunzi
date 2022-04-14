import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

import { Guild, Message } from 'discord.js';

export default class PreventProfanityEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        if (message.author.bot) return;

        const word = message.content;

        const isWhitelisted = await this.client.whitelist.check(word, <Guild>message.guild);
        if (isWhitelisted) return;

        const toxic = await this.client.whitelist.isToxic(word);

        if (!toxic) return;
        message.delete();
        const attachment = this.client.util.attachment('https://c.tenor.com/7R0cugwI7k0AAAAC/watch-your-mouth-watch-your-profanity.gif');
        await message.channel.send({ content: 'Watch your profanity', files: [attachment] }).then(msg => setTimeout(() => msg.delete(), 3000));
    }
}