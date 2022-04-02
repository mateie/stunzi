import { CommandInteraction } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../interfaces/ICommand';

export default class MinecraftCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'ADMINISTRATOR';
        this.data
            .setName('server')
            .setDescription('Minecraft Server Stuff')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('gamemode')
                    .setDescription('Set a gamemode')
                    .addStringOption(option =>
                        option
                            .setName('username')
                            .setDescription('Minecraft username of a person')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('game_mode')
                            .setDescription('Gamemode to change it to')
                            .addChoices([
                                ['Survival', 'survival'],
                                ['Creative', 'creative'],
                                ['Spectator', 'spectator'],
                                ['Adventure', 'adventure']
                            ])
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('op')
                    .setDescription('OP/Deop someone')
                    .addStringOption(option =>
                        option
                            .setName('username')
                            .setDescription('Minecraft username of a person')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('start')
                    .setDescription('Start the minecraft server')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('stop')
                    .setDescription('Stop the minecraft server')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('restart')
                    .setDescription('Restart the minecraft server')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        switch (options.getSubcommand()) {
            case 'gamemode': {
                if (!this.client.minecraft.online) return interaction.reply({ content: 'Server is offline', ephemeral: true });
                const username = <string>options.getString('username');
                const mode = <string>options.getString('game_mode');

                const online = await this.client.minecraft.rconConnection.util.isOnline(username);

                if (!online) return interaction.reply({ content: `**${username}** is not online`, ephemeral: true });

                await this.client.minecraft.rconConnection.send(`gamemode ${mode} ${username}`);
                return interaction.reply({ content: `**${username}** Gamemode updated to ***${this.client.util.capFirstLetter(mode)}***`, ephemeral: true });
            }
            case 'op': {
                if (!this.client.minecraft.online) return interaction.reply({ content: 'Server is offline', ephemeral: true });
                const username = <string>options.getString('username');

                const online = await this.client.minecraft.rconConnection.util.isOnline(username);

                if (!online) return interaction.reply({ content: `**${username}** is not online`, ephemeral: true });

                const isOp = await this.client.minecraft.rconConnection.util.isOp(username);

                if (!isOp) {
                    await this.client.minecraft.rconConnection.send(`deop ${username}`);
                    return interaction.reply({ content: `Removed OP from **${username}**` })
                }
                await this.client.minecraft.rconConnection.send(`op ${username}`);
                return interaction.reply({ content: `Gave OP to **${username}**` })
            }
            case 'start': {
                if (this.client.minecraft.online) return interaction.reply({ content: 'Server is already up', ephemeral: true });
                try {
                    await this.client.minecraft.start();
                    return interaction.reply({ content: '**Started the minecraft server**', ephemeral: true });
                } catch (err) {
                    console.error(err);
                    return interaction.reply({ content: '**Couldn\'t start the minecraft server**', ephemeral: true });
                }
            }
            case 'stop': {
                if (!this.client.minecraft.online) return interaction.reply({ content: 'Server is already offline', ephemeral: true });
                await this.client.minecraft.rconConnection.send('stop');
                return interaction.reply({ content: '**Stopped the minecraft server**', ephemeral: true });
            }
            case 'restart': {
                if (!this.client.minecraft.online) return interaction.reply({ content: 'Server is already offline', ephemeral: true });
                await interaction.deferReply({ ephemeral: true });
                await this.client.minecraft.rconConnection.send('stop');
                setTimeout(() => {
                    this.client.minecraft.start();
                    interaction.editReply({ content: '**Restarted the minecraft server**' });
                }, 5000);
                break;
            }
        }
    }
}
