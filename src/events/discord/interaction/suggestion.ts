import { ButtonInteraction, GuildMember, Message, MessageEmbed, Permissions } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from "@interfaces/IEvent";
import Suggestion from '@schemas/Suggestion';

export default class SuggestionEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.isButton()) return;

        const { customId } = interaction;

        if (!['suggest-accept', 'suggest-decline'].includes(customId)) return;

        const member: GuildMember = <GuildMember>interaction.member;
        const message: Message = <Message>interaction.message;

        if (!member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You cannot use this button', ephemeral: true });

        try {
            const suggestion = await Suggestion.findOne({ messageId: message.id });
            if (!suggestion) return interaction.reply({ content: 'Suggestion was not found', ephemeral: true });

            const embed = <MessageEmbed>message.embeds[0];
            if (!embed) return;

            switch (customId) {
                case 'suggest-accept': {
                    embed.fields[2] = { name: 'Status', value: 'Accepted', inline: true };
                    message.edit({ embeds: [embed.setColor('GREEN')], components: [] });
                    return interaction.reply({ content: 'Suggestion accepted', ephemeral: true });
                }
                case 'suggest-decline': {
                    embed.fields[2] = { name: 'Status', value: 'Declined', inline: true };
                    message.edit({ embeds: [embed.setColor('RED')], components: [] });
                    return interaction.reply({ content: 'Suggestion declined', ephemeral: true });
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
}