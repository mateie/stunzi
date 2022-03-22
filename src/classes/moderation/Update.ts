import { Collection, CommandInteraction, EmojiResolvable, Guild, GuildEmoji, Message, MessageEmbed, TextChannel } from "discord.js";
import Client from "../Client";
import channels from "../../data/channels";
import games from "../../data/games";
import strings from "../../data/strings";

export default class Update {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async rules(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const channel = <TextChannel>guild.channels.cache.get(channels.text.rules);
        const messages = <Collection<string, Message>>await channel.messages.fetch();
        const message = <Message>messages.first();
        const embed = <MessageEmbed>message.embeds[0];
        const row = this.client.util.actionRow()
            .addComponents(
                this.client.util.button()
                    .setCustomId('accept_rules')
                    .setLabel('Accept Rules')
                    .setStyle('SUCCESS')
            )
        await message.edit({ content: null, embeds: [embed.setDescription(strings.rules)], components: [row] });
        await interaction.reply({ content: 'Updated Rules', ephemeral: true });
    }

    async gameRoles(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const channel = <TextChannel>guild.channels.cache.get(channels.text.games);
        const messages = <Collection<string, Message>>await channel.messages.fetch();
        const message = <Message>messages.first();
        const emojis = guild.emojis.cache
            .map((emoji: GuildEmoji) => {
                if (games.some(game => emoji.name == game)) return emoji;
            })
            .filter(el => el !== undefined);
        const buttons = games.map(game => {
            const gameName = this.client.util.capEachFirstLetter(game.split('_'));
            return this.client.util.button()
                .setCustomId(`${game}-role`)
                .setLabel(gameName === 'Csgo' ? 'CSGO' : gameName)
                .setEmoji(<EmojiResolvable>emojis.find((emoji) => emoji?.name == game))
                .setStyle('SECONDARY');
        });

        const row = this.client.util.actionRow().addComponents(buttons);

        await message.edit({ components: [row] });
        await interaction.reply({ content: 'Updated Game Roles', ephemeral: true });
    }
}