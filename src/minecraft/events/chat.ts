import { TextChannel } from "discord.js";
import Client from "../../classes/Client";
import Event from "../../classes/Event";
import IEvent from "../../classes/interfaces/IEvent";
import channels from "../../data/channels";

export default class MinecraftChatEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'chat';
    }

    async run(chat: any) {
        const channel = <TextChannel>this.client.mainGuild?.channels.cache.get(channels.text.minecraft.serverChat);

        channel.send(`> 💬 **${chat.player}** - ${chat.message} <t:${Math.floor(chat.timestamp / 1000)}:R>`);
    }
}