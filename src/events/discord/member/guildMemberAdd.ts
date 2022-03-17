import { Guild, GuildMember, User, WebhookClient } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/interfaces/Event";
import webhooks from '../../../data/webhooks';

export default class GuildMemberAddEvent implements Event {
    client: Client;
    name: string;

    constructor(client: Client) {
        this.client = client;

        this.name = 'guildMemberAdd';
    }

    run(member: GuildMember) {
        const { user, guild }: { user: User, guild: Guild } = member;

        const Welcomer: WebhookClient = new WebhookClient({ url: <string>webhooks.welcomer });

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

        Welcomer.send({ embeds: [welcome] });
    }
}