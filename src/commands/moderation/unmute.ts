import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class UnmuteCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MUTE_MEMBERS';
        this.data
            .setName('unmute')
            .setDescription('Unmute')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member who will be muted')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const isMuted = await this.client.mutes.isMuted(member);
        if (!isMuted) return interaction.reply({ content: `${member} is not muted`, ephemeral: true });

        this.client.mutes.unmute(member);

        interaction.reply({ content: `${member} is unmuted` });
    }
}