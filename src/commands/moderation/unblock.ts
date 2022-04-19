import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';
import channels from '@data/channels';

export default class UnblockCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MODERATE_MEMBERS';
        this.data
            .setName('unblock')
            .setDescription('Allow a member to use commands again')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to unblock')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const isBlocked = await this.client.blocks.isBlocked(member);
        if (!isBlocked) return interaction.reply({ content: `${member} is not blocked`, ephemeral: true });

        const channel = <TextChannel>member.guild.channels.cache.get(channels.text.publicLogs);

        await this.client.blocks.unblock(member, channel);

        interaction.reply({ content: `${member} was unblocked`, ephemeral: true  });
    }
}