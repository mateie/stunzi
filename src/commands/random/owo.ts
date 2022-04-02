import { CommandInteraction } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class OWOCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('owo')
            .setDescription('OwOify any text')
            .addStringOption(option =>
                option
                    .setName('text')
                    .setDescription('OwO :>')
                    .setRequired(true)
            )
    }

    async run(interaction: CommandInteraction) {
        const text = <string>interaction.options.getString('text');

        const { owo } = await this.client.nekos.sfw.OwOify({ text });

        return interaction.reply({ content: owo });
    }
}