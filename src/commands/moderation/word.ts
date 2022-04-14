import { CommandInteraction, Guild } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class WordtCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'MANAGE_MESSAGES';
        this.data
            .setName('word')
            .setDescription('Word Whitelist')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('add')
                    .setDescription('Add a word to the whitelist')
                    .addStringOption(option =>
                        option
                            .setName('word')
                            .setDescription('Word to add to the whitelist (seperate each word with a comma if multiple)')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove a word from the whitelist')
                    .addStringOption(option =>
                        option
                            .setName('word')
                            .setDescription('Word to remove from the whitelist (seperate each word with a comma if multiple)')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('list')
                    .setDescription('List all the words')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const guild = <Guild>interaction.guild;
        switch (options.getSubcommand()) {
        case 'add': {
            const word = <string>options.getString('word');
            if (word.split(',').length > 1) {
                const words = word.split(',');
                const exists = await this.client.whitelist.checkMultiple(words, guild);
                if (exists.length > 0) return interaction.reply({ content: `The word **${this.client.util.list(exists)}** are already in a whitelist`, ephemeral: true });
                return this.client.whitelist.addMultiple(interaction, words, guild);
            }
                
            const exists = await this.client.whitelist.check(word, guild);
            if (exists) return interaction.reply({ content: `The word **${word}** is already in a whitelist`, ephemeral: true });
            return this.client.whitelist.add(interaction, word, guild);
        }
        case 'remove': {
            const word = <string>options.getString('word');
            if (word.split(',').length > 1) {
                const words = word.split(',');
                const exists = await this.client.whitelist.checkMultiple(words, guild);
                if (exists.length < 1) return interaction.reply({ content: `The word **${this.client.util.list(words)}** are not in a whitelist`, ephemeral: true });
                return this.client.whitelist.removeMultiple(interaction, words, guild);
            }
                
            const exists = await this.client.whitelist.check(word, guild);
            if (!exists) return interaction.reply({ content: `The word **${word}** is not in a whitelist`, ephemeral: true });
            return this.client.whitelist.remove(interaction, word, guild);   
        }
        case 'list': {
            const list = await this.client.whitelist.get(guild);
            return interaction.reply({ content: `Current Word Whitelist: **${list.join(', ')}**`, ephemeral: true });
        }
        }
    }
}