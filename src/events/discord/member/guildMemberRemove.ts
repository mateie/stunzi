import { Guild, GuildMember, User } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import webhooks from '@data/webhooks';

export default class GuildMemberRemoveEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'guildMemberRemove';
    }

    run(member: GuildMember) {
        const { user, guild }: { user: User, guild: Guild } = member;

        const webhook = this.client.webhooks.get(webhooks.goodbyer);

        const avatar = <string>user.avatarURL({ dynamic: true });

        const goodbye = this.client.util.embed()
            .setAuthor({ name: user.tag, iconURL: avatar })
            .setThumbnail(avatar)
            .setDescription(`
                ${member} left **${guild.name}**\n
                Joined: <t:${Math.floor(<number>member.joinedTimestamp / 1000)}:R>\nLatest Member Count: **${guild.memberCount}**

                Farewell, I hope you had a good stay
            `);

        webhook?.send({ embeds: [goodbye] });
    }
}