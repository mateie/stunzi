import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';

export default class SMPCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('smp')
            .setDescription('SMP Commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('whisper')
                    .setDescription('Whisper someone in game')
                    .addStringOption(option =>
                        option
                            .setName('username')
                            .setDescription('Their minecraft username')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('message')
                            .setDescription('Your message')
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        switch (options.getSubcommand()) {
            case 'whisper': {
                const username = <string>options.getString('username');
                const message = options.getString('message');
                const member = <GuildMember>interaction.member;

                const online = await this.client.minecraft.rconConnection.util.isOnline(username);

                if (!online) return interaction.reply({ content: `${username} is not online`, ephemeral: true });

                await this.client.minecraft.rconConnection.send(`msg ${username} "${member.user.tag} - ${message}"`);
                return interaction.reply({ content: `Whispered to **${username}**`, ephemeral: true });
            }
        }
    }
}