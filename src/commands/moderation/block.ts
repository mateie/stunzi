import { CommandInteraction, GuildMember } from "discord.js";
import Client from "@classes/Client";
import Command from "@classes/Command"
import ICommand from "@interfaces/ICommand";

export default class BlockCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MODERATE_MEMBERS';
        this.data
            .setName('block')
            .setDescription('Block member from using commands')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Who do you want to block?')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('time')
                    .setDescription('Expire date for this block (1m, 1h, 1d)')
            )
            .addStringOption(option =>
                option
                    .setName('reason')
                    .setDescription('Why do you want to block this member')
            )
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        const time = options.getString('time');
        const reason = options.getString('reason') || 'No reason specified';

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        this.client.blocks.create(interaction, member, time, reason);
    }
}