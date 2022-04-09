import { ContextMenuInteraction, Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/Menu';
import IMenu from '@interfaces/IMenu';
import { ModalSubmitInteraction } from '@mateie/discord-modals';

export default class ReportMemberMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('Report Member')
            .setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        const target = <GuildMember>await guild.members.fetch(interaction.targetId);

        if (target.user.bot) return interaction.reply({ content: `${target} is a bot`, ephemeral: true });

        if (member.id === target.id) return interaction.reply({ content: 'You cannot report yourself', ephemeral: true });

        const modal = this.client.util.modal()
            .setCustomId('report-member-modal')
            .setTitle(`Reporting ${target.user.tag}`)
            .addComponents([
                this.client.util.input()
                    .setCustomId('report-member-reason')
                    .setLabel('Reason for the report')
                    .setStyle('SHORT')
                    .setMinLength(4)
                    .setMaxLength(100)
                    .setPlaceholder('Type your reason here')
                    .setRequired(true)
            ]);
        
        this.client.util.showModal(modal, { client: this.client, interaction });

        this.client.on('modalSubmit', (interaction: ModalSubmitInteraction) => {
            if (!['report-member-modal'].includes(interaction.customId)) return;

            switch (interaction.customId) {
            case 'report-member-modal': {
                const reportReason = interaction.getTextInputValue('report-member-reason');
                this.client.reports.create(interaction, target, reportReason);
                break;
            }
            }
        });
        
    }
}