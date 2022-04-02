import { CommandInteraction, Options } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../interfaces/ICommand";

export default class UpdateCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'ADMINISTRATOR';
        this.data
            .setName('update')
            .setDescription('Update info in channels')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('rules')
                    .setDescription('Update rules')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('games')
                    .setDescription('Update Game Roles')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('vc')
                    .setDescription('Update Game VC')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        switch (options.getSubcommand()) {
            case 'rules': {
                this.client.update.rules(interaction);
                break;
            }
            case 'games': {
                this.client.update.gameRoles(interaction);
                break;
            }
            case 'vc': {
                this.client.update.updateGameVC(interaction);
                break;
            }
        }
    }
}