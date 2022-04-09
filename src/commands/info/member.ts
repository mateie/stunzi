import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class MemberCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('member')
            .setDescription('Information about a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Which user\'s information do you want to view?')
                    .setRequired(false)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = options.getMember('member') ? <GuildMember>options.getMember('member') : <GuildMember>interaction.member;

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        return this.client.util.memberInfo(interaction, member);
    }
}