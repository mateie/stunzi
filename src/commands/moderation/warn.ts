import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';

export default class WarnCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MODERATE_MEMBERS';
        this.data
            .setName('warn')
            .setDescription('Warn a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to warn')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason to warn this member')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        const reason = options.getString('reason') || 'No reason specified';

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        this.client.warns.create(interaction, member, reason);
    }
}