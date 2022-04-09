import { CategoryChannel, Guild, GuildMember, VoiceState } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

import categories from '@data/categories';
import channels from '@data/channels';

export default class CreateGameVCEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'voiceStateUpdate';
    }

    async run(oldState: VoiceState, newState: VoiceState) {
        this.cleanupTempVC(newState);
        if (newState.channelId !== channels.voice.createAVC) return;

        const guild = <Guild>newState.guild;
        const member = <GuildMember>newState.member;

        if (member.user.bot) return;

        const parent = <CategoryChannel>guild.channels.cache.get(categories.games);
        const perms = parent.permissionOverwrites.cache;

        const tempChannel = await guild.channels.create(`${member.user.tag} Temporary`, {
            parent,
            type: 'GUILD_VOICE',
            position: 99,
            userLimit: 1,
            permissionOverwrites: perms,
        });

        await tempChannel.permissionOverwrites.create(newState.id, { MOVE_MEMBERS: true });

        this.client.tempCreateVC.set(member.id, tempChannel);
        await newState.setChannel(tempChannel);
    }

    cleanupTempVC(state: VoiceState) {
        const guild = <Guild>state.guild;
        const parent = <CategoryChannel>guild.channels.cache.get(categories.games);
        const member = <GuildMember>state.member;

        parent.children.forEach(channel => {
            if (channel.type !== 'GUILD_VOICE') return;
            if (channel.id === channels.voice.createAVC) return;
            if (channel.members.size < 1) {
                channel.delete();
                this.client.tempCreateVC.delete(member.id);
            }
        });
    }
}