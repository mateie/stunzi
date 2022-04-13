import { Guild, GuildMember, User } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import webhooks from '@data/webhooks';

export default class GuildMemberAddEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'guildMemberAdd';
    }

    run(member: GuildMember) {
        const { user, guild }: { user: User, guild: Guild } = member;

        const webhook = this.client.webhooks.get(webhooks.welcomer);

        const avatar = <string>user.avatarURL({ dynamic: true });

        const welcome = this.client.util.embed()
            .setAuthor({ name: user.tag, iconURL: avatar })
            .setThumbnail(avatar)
            .setDescription(`
                Welcome ${member} to **${guild.name}** :>

                Account Created: <t:${Math.floor(user.createdTimestamp / 1000)}:R>
            Latest Member Count: ** ${guild.memberCount} **

                *** Don't forget to read the rules***!
                `);

        webhook?.send({ embeds: [welcome] });
    }
}