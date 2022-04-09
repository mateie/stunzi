import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class BlocksCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'VIEW_AUDIT_LOG';
        this.data
            .setName('blocks')
            .setDescription('Check blocks for the member')
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to check the blocks for')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>options.getMember('member');
        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        const guild = <Guild>interaction.guild;

        const blocks = await this.client.blocks.getAll(member);
        if (blocks.length < 1) return interaction.reply({ content: `${member} has no blocks`, ephemeral: true });

        const mapped = blocks.map(block => `
                **Blocked by**: ${guild.members.cache.get(block.by)}
                **Reason**: ${block.reason}
                **Expires**: ${block.time ? `<t:${Math.floor(block.time / 1000)}:R>` : 'Never'}
            `);

        this.client.util.pagination(interaction, mapped, `${member.user.tag}'s Blocks`);
    }
}