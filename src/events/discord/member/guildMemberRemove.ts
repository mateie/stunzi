import { Guild, GuildMember, User, WebhookClient } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/interfaces/Event";
import webhooks from "../../../data/webhooks";

export default class GuildMemberRemoveEvent implements Event {
    client: Client;
    name: string;

    constructor(client: Client) {
        this.client = client;

        this.name = 'guildMemberRemove';
    }

    run(member: GuildMember) {
        const { user, guild }: { user: User, guild: Guild } = member;

        const Goodbyer: WebhookClient = new WebhookClient({ url: <string>webhooks.goodbyer });

        const avatar = <string>user.avatarURL({ dynamic: true });

        const goodbye = this.client.util.embed()
            .setAuthor({ name: user.tag, iconURL: avatar })
            .setThumbnail(avatar)
            .setDescription(`
                ${member} left **${guild.name}**\n
                Joined: <t:${Math.floor(<number>member.joinedTimestamp / 1000)}:R>\nLatest Member Count: **${guild.memberCount}**

                Farewell, I hope you had a good stay
            `);

        Goodbyer.send({ embeds: [goodbye] });
    }
}