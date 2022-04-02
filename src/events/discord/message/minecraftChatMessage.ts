import { GuildMember, Message, TextChannel } from 'discord.js';
import Client from '../../../classes/Client';
import Event from '../../../classes/Event';
import IEvent from '../../../interfaces/IEvent';
import channels from '../../../data/channels';

export default class MinecraftChatMessageEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        const channel = <TextChannel>message.channel;

        if (channel.id !== channels.text.minecraft.serverChat) return;
        if (!this.client.minecraft.online) return;

        const member = <GuildMember>message.member;

        if (member.user.bot) return;

        this.client.minecraft.rconConnection.send(`tellraw @a ["",{"text":"${member.user.tag} ","bold":true},{"text":"- ${message.content}"}]`);
    }
}