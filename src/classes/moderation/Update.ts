import { Collection, CommandInteraction, EmojiResolvable, Guild, GuildEmoji, Message, MessageEmbed, Role, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import channels from '@data/channels';
import games from '@data/games';
import strings from '@data/strings';

export default class Update {
    readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async rules(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const channel = <TextChannel>guild.channels.cache.get(channels.text.rules);
        const messages = <Collection<string, Message>>await channel.messages.fetch();
        const message = <Message>messages.first();
        const embed = <MessageEmbed>message.embeds[0];
        const row = this.client.util.row()
            .addComponents(
                this.client.util.button()
                    .setCustomId('accept_rules')
                    .setLabel('Accept Rules')
                    .setStyle('SUCCESS')
            );
        await message.edit({ content: null, embeds: [embed.setDescription(strings.rules)], components: [row] });
        await interaction.reply({ content: 'Updated Rules', ephemeral: true });
    }

    async gameRoles(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const channel = <TextChannel>guild.channels.cache.get(channels.text.games.roles);
        const messages = <Collection<string, Message>>await channel.messages.fetch();
        const message = <Message>messages.first();
        message.embeds[0].setDescription('Choose the games you play\n\n**Just click one of the buttons below :>**');
        const emojis = guild.emojis.cache
            .map((emoji: GuildEmoji) => {
                if (games.some(game => emoji.name == game)) return emoji;
            })
            .filter(el => el !== undefined);
        const buttons = games.map(game => {
            const role = <Role>guild.roles.cache.find(role => role.name.toLowerCase() === game.split('_').join(' ').toLowerCase());
            return this.client.util.button()
                .setCustomId(`${game}-role`)
                .setLabel(role.name)
                .setEmoji(<EmojiResolvable>emojis.find((emoji) => emoji?.name === game))
                .setStyle('SECONDARY');
        });

        const row = this.client.util.row().addComponents(buttons);

        await message.edit({ embeds: [message.embeds[0]], components: [row] });
        await interaction.reply({ content: 'Updated Game Roles', ephemeral: true });
    }

    async gameVC(interaction: CommandInteraction) {
        const guild = <Guild>interaction.guild;
        const channel = <TextChannel>guild.channels.cache.get(channels.text.games.createAVC);
        const messages = <Collection<string, Message>>await channel.messages.fetch();
        const message = <Message>messages.first();
        message.embeds[0].setDescription('Choose the game to create VC (Voice Channel) for\n\n**Just click one of the buttons below :>**');
        const emojis = guild.emojis.cache
            .map((emoji: GuildEmoji) => {
                if (games.some(game => emoji.name === game)) return emoji;
            })
            .filter(el => el !== undefined);

        const buttons = games.map(game => {
            const role = <Role>guild.roles.cache.find(role => role.name.toLowerCase() === game.split('_').join(' ').toLowerCase());
            return this.client.util.button()
                .setCustomId(`${game}-vc`)
                .setLabel(role.name)
                .setEmoji(<EmojiResolvable>emojis.find(emoji => emoji?.name === game))
                .setStyle('SECONDARY');
        });

        const row = this.client.util.row().addComponents(buttons);

        await message.edit({ embeds: [message.embeds[0]], components: [row] });
        await interaction.reply({ content: 'Updated Voice Channel Roles', ephemeral: true });
    }
}