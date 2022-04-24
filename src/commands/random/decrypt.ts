import { CommandInteraction } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';
import Cryptr from 'cryptr';

export default class DecryptCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('decrypt')
            .setDescription('Decrypt a text with a key')
            .addStringOption(option =>
                option
                    .setName('text')
                    .setDescription('Text decrypt')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('secret')
                    .setDescription('Secret key that was created for the text upon creation')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const text = <string>options.getString('text');
        const secret = <string>options.getString('secret');

        const cryptr = new Cryptr(secret);

        const decrypted = cryptr.decrypt(text);

        return interaction.reply({ content: `**Decrypted Text**: ${decrypted}`, ephemeral: true });
    }
}