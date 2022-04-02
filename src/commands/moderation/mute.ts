import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class MuteCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MUTE_MEMBERS';
        this.data
            .setName('mute')
            .setDescription('Mute a member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member who will be muted')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('Expire date for this mute (1m, 1h, 1d)')
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Reason to why mute this person')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        const time = options.getString('time');
        const reason = options.getString('reason') || 'No reason specified';

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        this.client.mutes.create(interaction, member, time, reason);
    }
}