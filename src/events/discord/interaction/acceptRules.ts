import { ButtonInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import roles from '@data/roles';

export default class AcceptRulesEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.isButton()) return;

        const { customId } = interaction;

        if (!['accept_rules'].includes(customId)) return;

        const member: GuildMember = <GuildMember>interaction.member;

        try {
            switch (customId) {
            case 'accept_rules': {
                if (member?.roles.cache.has(roles.member)) return interaction.reply({ content: 'You already a member :>', ephemeral: true });
                member.roles.add(roles.member);
                return interaction.reply({ content: 'You were assigned a member role, have a good stay :>', ephemeral: true });
            }
            }
        } catch (err) {
            console.error(err);
        }
    }
}