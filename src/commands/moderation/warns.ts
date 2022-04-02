import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../interfaces/ICommand';

export default class WarnsCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'VIEW_AUDIT_LOG';
        this.data
            .setName('warns')
            .setDescription('Check Warns of a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to check warns of')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        if (member.user.bot) return interaction.reply({ content: 'That member is a bot', ephemeral: true });

        const guild = <Guild>interaction.guild;

        const warns = await this.client.warns.getAll(member);
        if (warns.length < 1) return interaction.reply({ content: 'There were no warns found', ephemeral: true });

        const mapped = warns.map(warn => `
            **Warned By**: ${guild.members.cache.get(warn.by)}
            **Reason**: ${warn.reason}
        `);

        this.client.util.pagination(interaction, mapped, `${member.user.tag}'s Warns`);
    }
}