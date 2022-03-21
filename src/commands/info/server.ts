import { CommandInteraction, Guild } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../classes/interfaces/ICommand";

export default class ServerCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('server')
            .setDescription('Display Server Information');
    }

    async run(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const { createdTimestamp, description, members, memberCount, channels, emojis, stickers } = guild;

        const icon = <string>guild.iconURL({ dynamic: true });

        const embed = this.client.util.embed()
            .setAuthor({ name: guild.name, iconURL: icon })
            .setThumbnail(icon)
            .addFields(
                [
                    {
                        name: 'General',
                        value: `
                            Name: ${guild.name}
                            Created: <t:${Math.floor(createdTimestamp / 1000)}:R>
                            Owners: ${guild.members.cache.get(this.client.owners[0])} and ${guild.members.cache.get(this.client.owners[1])}

                            Description: ${description}
                        `
                    },
                    {
                        name: `👥| Users`,
                        value: `
                            - Members: ${members.cache.filter(m => !m.user.bot).size}
                            - Bots: ${members.cache.filter(m => m.user.bot).size}
                        
                            Total: ${memberCount}
                        `
                    },
                    {
                        name: `📃 | Channels`,
                        value: `
                            - Text: ${channels.cache.filter(ch => ch.type == 'GUILD_TEXT').size}
                            - Voice: ${channels.cache.filter(ch => ch.type == 'GUILD_VOICE').size}
                            - Threads: ${channels.cache.filter(ch => ch.type.includes('THREAD')).size}
                            - Categories: ${channels.cache.filter(ch => ch.type == 'GUILD_CATEGORY').size}
                            - Stages: ${channels.cache.filter(ch => ch.type == 'GUILD_STAGE_VOICE').size}
                            - News: ${channels.cache.filter(ch => ch.type == 'GUILD_NEWS').size}

                            Total: ${channels.cache.size}
                        `
                    },
                    {
                        name: `😯 | Emojis & Stickers`,
                        value: `
                            - Animated: ${emojis.cache.filter(e => e.animated == true).size}
                            - Static: ${emojis.cache.filter(e => !e.animated).size}
                            - Stickers: ${stickers.cache.size}

                            Total: ${emojis.cache.size + stickers.cache.size}
                        `
                    },
                    {
                        name: `Nitro Statistics`,
                        value: `
                            - Tier: ${guild.premiumTier.replace("TIER_", '')}
                            - Boosts: ${guild.premiumSubscriptionCount}
                            - Boosters: ${members.cache.filter(m => m.premiumSince !== null).size}
                        `
                    }
                ]
            );

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}