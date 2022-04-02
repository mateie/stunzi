import { GuildMember, Message } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

import blacklistedWords from '@data/blacklistedWords';

export default class PreventBlacklistedWordseEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {

        if (!blacklistedWords.includes(message.content)) return;

        await message.delete();
        const msg = await message.channel.send({ content: 'You cannot say that' });
        setTimeout(async () => {
            await msg.delete();
        }, 3000);
    }
}