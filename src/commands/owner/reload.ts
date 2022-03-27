import { CommandInteraction } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';

export default class ReloadCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'ADMINISTRATOR';
        this.data
            .setName('reload')
            .setDescription('Reload most things on the bot');
    }

    async run(interaction: CommandInteraction) {
        await this.client.commandHandler.reload();
        await this.client.menuHandler.reload();
        await this.client.deploy();

        interaction.reply({ content: 'Reloaded', ephemeral: true });
    }
}