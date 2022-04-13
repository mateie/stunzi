import { ModalSubmitInteraction } from '@mateie/discord-modals';
import { Guild, GuildMember, Message } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';

export default class MemberActionsModal extends Event {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'modalSubmit';
    }

    async run(interaction: ModalSubmitInteraction) {
        if (!['warn-member-modal', 'block-member-modal', 'mute-member-modal', 'report-member-modal'].includes(interaction.customId)) return;

        const message = <Message>interaction.message;
        const guild = <Guild>interaction.guild;

        if (!message) return;
        
        const target = <GuildMember>await guild.members.fetch(<string>message.embeds[0].footer?.text.split(':')[1]);

        switch (interaction.customId) {
        case 'warn-member-modal': {
            const warnReason = interaction.getTextInputValue('warn-member-reason');
            this.client.warns.create(interaction, target, warnReason);
            break;
        }
        case 'block-member-modal': {
            const blockReason = interaction.getTextInputValue('block-member-reason');
            const blockTime = interaction.getTextInputValue('block-member-time');
            this.client.blocks.create(interaction, target, blockTime, blockReason);
            break;
        }
        case 'mute-member-modal': {
            const muteReason = interaction.getTextInputValue('mute-member-reason');
            const muteTime = interaction.getTextInputValue('mute-member-time');
            this.client.mutes.create(interaction, target, muteTime, muteReason);
            break;
        }
        case 'report-member-modal': {
            const reportReason = interaction.getTextInputValue('report-member-reason');
            this.client.reports.create(interaction, target, reportReason);
            break;
        }
        }
    }
}