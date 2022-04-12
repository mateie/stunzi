import { CommandInteraction, Guild } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class WhitelistCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MANAGE_MESSAGES';
        this.data
            .setName('whitelist')
            .setDescription('Word Whitelist')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a word to the whitelist')
                    .addStringOption(option =>
                        option
                            .setName('word')
                            .setDescription('Word to whitelist')
                            .setRequired(true)
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = <Guild>interaction.guild;
        switch (options.getSubcommand()) {
        case 'add': {
            const word = <string>options.getString('word');
            return this.client.whitelist.add(interaction, word, guild);
        }
        }
    }
}