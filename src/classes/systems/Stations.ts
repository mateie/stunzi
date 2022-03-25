import { CategoryChannel, CommandInteraction, Guild, GuildChannel, GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import Client from '../Client';
import roles from '../../data/roles';
import categories from '../../data/categories';
import Station, { IStation } from '../../schemas/Station';
import moment from 'moment';

export default class Stations {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(member: GuildMember) {
        const guild = <Guild>member.guild;

        member.roles.add(roles.stationOwner);

        const channel = await guild.channels.create(`${member.user.tag.replace('#', '-')}-station`, {
            parent: <CategoryChannel>guild.channels.cache.get(categories.stations),
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: [
                        'SEND_MESSAGES',
                        'VIEW_CHANNEL',
                        'READ_MESSAGE_HISTORY',
                        'MANAGE_CHANNELS'
                    ],
                    deny: [
                        'USE_APPLICATION_COMMANDS',
                    ]
                },
                {
                    id: roles.member,
                    deny: [
                        'SEND_MESSAGES',
                        'VIEW_CHANNEL',
                        'READ_MESSAGE_HISTORY'
                    ]
                }
            ]
        });

        await Station.create({ memberId: member.id, channelId: channel.id });

        return channel;
    }

    async share(member: GuildMember, shareWith: GuildMember) {
        const station = <IStation>await this.get(member);
        const channel = <GuildChannel>await this.getChannel(member);

        channel.permissionOverwrites.edit(shareWith, {
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: false,
        });

        station.sharedWith.push(shareWith.id);

        await station.save();

    }

    async unshare(member: GuildMember, unshareWith: GuildMember) {
        const station = <IStation>await this.get(member);
        const channel = <GuildChannel>await this.getChannel(member);

        channel.permissionOverwrites.delete(unshareWith);

        station.sharedWith.filter(id => id !== unshareWith.id);

        await station.save();
    }

    async delete(member: GuildMember) {
        const guild = <Guild>member.guild;

        const station = <IStation>await this.get(member);

        member.roles.remove(roles.stationOwner);
        await Station.deleteOne({ memberId: member.id });
    }

    async deleteChannel(member: GuildMember, station: IStation) {
        const guild = <Guild>member.guild;
        const channel = <GuildChannel>guild.channels.cache.get(station.channelId);
        await channel.delete();
    }

    async get(member: GuildMember) {
        const station = await Station.findOne({ memberId: member.id });

        if (!station) return null;
        return station;
    }

    async getChannel(member: GuildMember) {
        const station = await this.get(member);

        if (!station) return null;
        const channel = member.guild.channels.cache.get(station.channelId);
        if (!channel) return null;
        return channel;
    }
}