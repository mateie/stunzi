import { GuildMember, Message, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import channels from '@data/channels';

export default class PreventSendingMessage extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        if (message.channel.type != 'GUILD_TEXT') return;

        const channel = <TextChannel>message.channel;

        if (![
            channels.text.welcome,
            channels.text.rules,
            channels.text.games.roles,
            channels.text.games.createAVC,
        ].includes(channel.id)) return;

        const member = <GuildMember>message.member;

        if (!member) return;
        if (member.user.bot) return;

        if (this.client.owners.includes(member.id) || this.client.user?.id == member.id) return;

        await message.delete();
        const msg = await channel.send({ content: 'You cannot send messages here' });
        setTimeout(async () => {
            await msg.delete();
        }, 3000);
    }
}