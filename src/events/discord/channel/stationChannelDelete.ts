import { Guild, GuildChannel, GuildMember } from 'discord.js';
import Client from '../../../classes/Client';
import Event from '../../../classes/Event';
import IEvent from '../../../classes/interfaces/IEvent';
import categories from '../../../data/categories';
import Station, { IStation } from '../../../schemas/Station';

export default class StationChannelDeleteEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'channelDelete';
    }

    async run(channel: GuildChannel) {
        if (channel.parentId != categories.stations) return;

        const station = <IStation>await Station.findOne({ channelId: channel.id });

        const guild = <Guild>channel.guild;
        const member = <GuildMember>guild.members.cache.get(station.memberId);

        member.send({ content: `Your station was deleted` })
            .then(message => {
                setTimeout(() => {
                    message.delete();
                }, 5000);
            });

        this.client.stations.delete(member);
    }
}