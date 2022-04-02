import { CategoryChannel, Guild, GuildMember, VoiceChannel, VoiceState } from "discord.js";
import Client from "@classes/Client";
import Event from "@classes/Event";
import IEvent from "@interfaces/IEvent";

import categories from "@data/categories";

export default class CreateGameVCEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'voiceStateUpdate';
    }

    async run(oldState: VoiceState, newState: VoiceState) {
        const valorantCategory = <CategoryChannel>this.client.mainGuild.channels.cache.get(categories.valorant);
        const dbdCategory = <CategoryChannel>this.client.mainGuild.channels.cache.get(categories.dead_by_daylight);
        const minecraftCategory = <CategoryChannel>this.client.mainGuild.channels.cache.get(categories.minecraft);

        valorantCategory.children.forEach(channel => {
            if (channel.type !== 'GUILD_VOICE') return;
            if (channel.members.size < 1) channel.delete();
        });

        dbdCategory.children.forEach(channel => {
            if (channel.type !== 'GUILD_VOICE') return;
            if (channel.members.size < 1) channel.delete();
        });

        minecraftCategory.children.forEach(channel => {
            if (channel.type !== 'GUILD_VOICE') return;
            if (channel.members.size < 1) channel.delete();
        });
    }
}