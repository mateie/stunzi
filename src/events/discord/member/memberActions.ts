import { ButtonInteraction, Guild, GuildMember, Message, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';
import channels from '@data/channels';

export default class MemberActionsEvent extends Event implements IEvent {
    name: string;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        if (![
            'show_rank',
            'show_warns',
            'show_blocks',
            'report_member',
            'show_mutes',
            'warn_member',
            'block_member',
            'mute_member',
            'unblock_member',
            'unmute_member'
        ].includes(interaction.customId)) return;

        const message: Message = <Message>interaction.message;
        const member: GuildMember = <GuildMember>interaction.member;
        const guild: Guild = <Guild>interaction.guild;

        const target = <GuildMember>await guild.members.fetch(<string>message?.embeds[0]?.footer?.text.split(':')[1]);

        const channel = <TextChannel>guild.channels.cache.get(channels.text.publicLogs);

        switch (interaction.customId) {
        case 'show_rank': {
            const image = await this.client.cards.rank.getRankCard(target);
            const attachment = this.client.util.attachment(image, `rank-${member.user.username}.png`);
            return interaction.reply({ files: [attachment], ephemeral: true });
        }
        case 'report-member': {
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
        
            return this.client.util.showModal(modal, { client: this.client, interaction });
        }
        case 'show_warns': {
            if (!member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const warns = await this.client.warns.getAll(target);
            if (warns.length < 1) return interaction.reply({ content: `${target} has no warns`, ephemeral: true });
            const mapped = warns.map(warn => `
                        **Warned By**: ${guild.members.cache.get(warn.by)}
                        **Reason**: ${warn.reason}
                    `);

            this.client.util.pagination(interaction, mapped, `${target.user.tag}'s Warns`, true);
            break;
        }
        case 'show_blocks': {
            if (!member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const blocks = await this.client.blocks.getAll(target);
            if (blocks.length < 1) return interaction.reply({ content: `${target} has no blocks`, ephemeral: true });
            const mapped = blocks.map(block => {
                const blocker = guild.members.cache.get(block.by);
                const time = block.time ? `<t:${Math.floor(block.time / 1000)}:R>` : 'Indefinite';
                return `
                        **Blocked by**: ${blocker}
                        **Reason**: ${block.reason}
                        **${block.expired ? 'Expired on' : 'Expires on'}**: ${time}
                    `;
            });

            this.client.util.pagination(interaction, mapped, `${target.user.tag}'s Blocks`, true);
            break;
        }
        case 'show_mutes': {
            if (!member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const mutes = await this.client.mutes.getAll(target);
            if (mutes.length < 1) return interaction.reply({ content: `${target} has no mutes`, ephemeral: true });
            const mapped = mutes.map(mute => {
                const muter = guild.members.cache.get(mute.by);
                const time = mute.time ? `<t:${Math.floor(mute.time / 1000)}:R>` : 'Indefinite';
                return `
                        **Blocked by**: ${muter}
                        **Reason**: ${mute.reason}
                        **${mute.expired ? 'Expired on' : 'Expires on'}**: ${time}
                    `;
            });

            this.client.util.pagination(interaction, mapped, `${target.user.tag}'s Mutes`, true);
            break;
        }
        case 'warn_member': {
            if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const modal = this.client.util.modal()
                .setCustomId('warn-member-modal')
                .setTitle(`Warning ${target.user.tag}`)
                .addComponents([
                    this.client.util.input()
                        .setCustomId('warn-member-reason')
                        .setLabel('Reason for the warn')
                        .setStyle('SHORT')
                        .setMinLength(4)
                        .setMaxLength(100)
                        .setPlaceholder('Type your reason here')
                        .setRequired(true)
                ]);

            this.client.util.showModal(modal, { client: this.client, interaction });
            break;
        }
        case 'block_member': {
            if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const modal = this.client.util.modal()
                .setCustomId('block-member-modal')
                .setTitle(`Blocking ${target.user.tag}`)
                .addComponents([
                    this.client.util.input()
                        .setCustomId('block-member-time')
                        .setLabel('Time for the block')
                        .setStyle('SHORT')
                        .setMinLength(2)
                        .setMaxLength(2)
                        .setPlaceholder('Type your time here (1m, 1h, 1d)')
                        .setRequired(false),
                    this.client.util.input()
                        .setCustomId('block-member-reason')
                        .setLabel('Reason for the block')
                        .setStyle('SHORT')
                        .setMinLength(4)
                        .setMaxLength(100)
                        .setPlaceholder('Type your reason here')
                        .setRequired(true)
                ]);

            this.client.util.showModal(modal, { client: this.client, interaction });
            break;
        }
        case 'mute_member': {
            if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const modal = this.client.util.modal()
                .setCustomId('mute-member-modal')
                .setTitle(`Muting ${target.user.tag}`)
                .addComponents([
                    this.client.util.input()
                        .setCustomId('mute-member-time')
                        .setLabel('Time for the mute')
                        .setStyle('SHORT')
                        .setMinLength(2)
                        .setMaxLength(2)
                        .setPlaceholder('Type your time here (1m, 1h, 1d)')
                        .setRequired(false),
                    this.client.util.input()
                        .setCustomId('mute-member-reason')
                        .setLabel('Reason for the mute')
                        .setStyle('SHORT')
                        .setMinLength(4)
                        .setMaxLength(100)
                        .setPlaceholder('Type your reason here')
                        .setRequired(true)
                ]);

            this.client.util.showModal(modal, { client: this.client, interaction });
            break;
        }
        case 'unblock_member': {
            if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const isBlocked = await this.client.blocks.isBlocked(target);
            if (!isBlocked) return interaction.reply({ content: `${target} is already unblocked`, ephemeral: true });
            const channel = <TextChannel>guild.channels.cache.get(channels.text.publicLogs);
            this.client.blocks.unblock(target, channel);
            interaction.reply({ content: `${target} was unblocked` });
            break;
        }
        case 'unmute_member': {
            if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
            const isMuted = await this.client.mutes.isMuted(target);
            if (!isMuted) return interaction.reply({ content: `${target} is already unmuted`, ephemeral: true });
            this.client.mutes.unmute(target, channel);
            interaction.reply({ content: `${target} was unmuted` });
            break;
        }
        }
    }
}