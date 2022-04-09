import { TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import channels from '@data/channels';

export default class MinecraftStartEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'start';
    }

    async run() {
        this.client.minecraft.online = true;
        const emoji = this.client.mainGuild?.emojis.cache.find(em => em.name === 'up_arrow');
        const channel = <TextChannel>this.client.mainGuild?.channels.cache.get(channels.text.minecraft.serverChat);

        channel.send(`> ${emoji} **Server Went Online**`);

        console.log('Minecraft Server is Up');
    }
}