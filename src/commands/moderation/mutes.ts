import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class MutesCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'VIEW_AUDIT_LOG';
        this.data
            .setName('mutes')
            .setDescription('Check mutes of a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to check the mutes for')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const guild = <Guild>interaction.guild;

        const mutes = await this.client.mutes.getAll(member);
        if (mutes.length < 1) return interaction.reply({ content: `${member} has no mutes`, ephemeral: true });

        const mapped = mutes.map(mute => `
                **Muted by**: ${guild.members.cache.get(mute.by)}
                **Reason**: ${mute.reason}
                **Expires**: ${mute.time ? `<t:${Math.floor(mute.time / 1000)}:R>` : 'Never'}
            `);

        this.client.util.pagination(interaction, mapped, `${member.user.tag}'s Mutes`);
    }
}