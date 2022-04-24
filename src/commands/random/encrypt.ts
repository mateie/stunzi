import { CommandInteraction } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';
import Cryptr from 'cryptr';

export default class EncryptCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('encrypt')
            .setDescription('Encrypt a text')
            .addStringOption(option =>
                option
                    .setName('text')
                    .setDescription('Text to encrypt')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const text = <string>options.getString('text');

        const secret = this.client.cypher.makeSecret();

        const cryptr = new Cryptr(secret);

        const encrypted = cryptr.encrypt(text);

        return interaction.reply({ content: `**Encrypted Text**: ${encrypted}\n**Key**: ${secret}\n\n***Do not lose the key, if you want to decrypt this text later***`, ephemeral: true });
    }
}