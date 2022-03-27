import { TextChannel } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import IEvent from "../../../classes/interfaces/IEvent";
import channels from "../../../data/channels";

export default class MinecraftLogoutEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'logout';
    }

    async run(logout: any) {
        const channel = <TextChannel>this.client.mainGuild?.channels.cache.get(channels.text.minecraft.serverChat);

        channel.send(`> **${logout.player}** Left the server <t:${Math.floor(Date.now() / 1000)}:R> Reason: ${logout.reason}`);
    }
} 