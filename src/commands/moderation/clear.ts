import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class ClearCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MANAGE_MESSAGES';
        this.data
            .setName('clear')
            .setDescription('Clear a channel')
            .addNumberOption(option =>
                option
                    .setName('amount')
                    .setDescription('Amount of messages')
                    .setRequired(true)
            )
            .addUserOption(option =>
                option
                    .setName('member')
                    .setDescription('Member to clear their messages')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const channel = <TextChannel>interaction.channel;

        const amount = <number>options.getNumber('amount');
        const member = <GuildMember>options.getMember('target');

        const embed = this.client.util.embed();

        if (member) {
            let messages = await channel.messages.fetch();
            messages = messages.filter(m => m.author.id == member.id);

            await channel.bulkDelete(messages, true).then(messages => {
                embed.setDescription(`Cleared ${messages.size} from ${member} in this channel`);
                return interaction.reply({ embeds: [embed] });
            });

            return;
        }

        await channel.bulkDelete(amount, true).then(messages => {
            embed.setDescription(`Cleared ${messages.size} from this channel`);
            return interaction.reply({ embeds: [embed] });
        });
    }
}