import { ButtonInteraction, Guild, GuildMember, Integration, Message } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import IEvent from "../../../classes/interfaces/IEvent";

export default class MemberActionsEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        const message: Message = <Message>interaction.message;
        const member: GuildMember = <GuildMember>interaction.member;
        const guild: Guild = <Guild>interaction.guild;
        const customId: string = interaction.customId;

        if (![
            'show_card',
            'show_warns',
            'show_blocks',
            'show_mutes',
            'warn_member',
            'block_member',
            'mute_member',
            'unblock_member',
            'unmute_member'
        ].includes(customId)) return;

        const target: GuildMember = <GuildMember>guild.members.cache.get(message.embeds[0].fields[0].value);

        switch (customId) {
            case `show_rank`: {
                const image = await this.client.cards.getRankCard(member);
                const attachment = this.client.util.attachment(image, `rank-${member.user.username}.png`);
                return interaction.reply({ files: [attachment], ephemeral: true });
            }
            case `show_warns`: {
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
            case `show_blocks`: {
                if (!member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const blocks = await this.client.blocks.getAll(target);
                if (blocks.length < 1) return interaction.reply({ content: `${target} has no blocks`, ephemeral: true });
                const mapped = blocks.map(block => {
                    const blocker = guild.members.cache.get(block.by);
                    const time = block.time ? `<t:${Math.floor(block.time / 1000)}` : 'Indefinite';
                    return `
                        **Blocked by**: ${blocker}
                        **Reason**: ${block.reason}
                        **Expires on**: ${time}
                    `;
                });

                this.client.util.pagination(interaction, mapped, `${target.user.tag}'s Blocks`, true);
                break;
            }
            case `show_mutes`: {
                if (!member.permissions.has('VIEW_AUDIT_LOG')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const mutes = await this.client.mutes.getAll(target);
                if (mutes.length < 1) return interaction.reply({ content: `${target} has no mutes`, ephemeral: true });
                const mapped = mutes.map(mute => {
                    const blocker = guild.members.cache.get(mute.by);
                    const time = mute.time ? `<t:${Math.floor(mute.time / 1000)}` : 'Indefinite';
                    return `
                        **Blocked by**: ${blocker}
                        **Reason**: ${mute.reason}
                        **Expires on**: ${time}
                    `;
                });

                this.client.util.pagination(interaction, mapped, `${target.user.tag}'s Mutes`, true);
                break;
            }
            case `warn_member`: {
                if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const modal = this.client.util.modal()
                    .setCustomId('warn-member-modal')
                    .setTitle(`Warning ${target.user.tag}`)
                    .addComponents([
                        this.client.util.textInput()
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
            case `block_member`: {
                if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const modal = this.client.util.modal()
                    .setCustomId('block-member-modal')
                    .setTitle(`Blocking ${target.user.tag}`)
                    .addComponents([
                        this.client.util.textInput()
                            .setCustomId('block-member-time')
                            .setLabel('Time for the block')
                            .setStyle('SHORT')
                            .setMaxLength(2)
                            .setMaxLength(2)
                            .setPlaceholder('Type your time here (1m, 1h, 1d)')
                            .setRequired(false),
                        this.client.util.textInput()
                            .setCustomId('block-member-reason')
                            .setLabel('Reason for the block')
                            .setStyle('SHORT')
                            .setMaxLength(4)
                            .setMaxLength(100)
                            .setPlaceholder('Type your reason here')
                            .setRequired(true)
                    ]);

                this.client.util.showModal(modal, { client: this.client, interaction });
                break;
            }
            case `mute_member`:
                if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const modal = this.client.util.modal()
                    .setCustomId('mute-member-modal')
                    .setTitle(`Muting ${target.user.tag}`)
                    .addComponents([
                        this.client.util.textInput()
                            .setCustomId('mute-member-time')
                            .setLabel('Time for the mute')
                            .setStyle('SHORT')
                            .setMaxLength(2)
                            .setMaxLength(2)
                            .setPlaceholder('Type your time here (1m, 1h, 1d)')
                            .setRequired(false),
                        this.client.util.textInput()
                            .setCustomId('mute-member-reason')
                            .setLabel('Reason for the mute')
                            .setStyle('SHORT')
                            .setMaxLength(4)
                            .setMaxLength(100)
                            .setPlaceholder('Type your reason here')
                            .setRequired(true)
                    ]);

                this.client.util.showModal(modal, { client: this.client, interaction });
                break;
            case 'unblock_member': {
                if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const isBlocked = await this.client.blocks.isBlocked(target);
                if (!isBlocked) return interaction.reply({ content: `${target} is already unblocked`, ephemeral: true });
                this.client.blocks.unblock(target);
                interaction.reply({ content: `${target} was unblocked` });
                break;
            }
            case 'unmute_member': {
                if (!member.permissions.has('MODERATE_MEMBERS')) return interaction.reply({ content: 'Not enough permissions', ephemeral: true });
                const isMuted = await this.client.mutes.isMuted(target);
                if (!isMuted) return interaction.reply({ content: `${target} is already unmuted`, ephemeral: true });
                this.client.mutes.unmute(target);
                interaction.reply({ content: `${target} was unmuted` });
                break;
            }
        }
    }
}