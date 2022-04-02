import { CommandInteraction } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

export default class EightBallCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('8ball')
            .setDescription('8 Ball be like')
            .addStringOption(option =>
                option
                    .setName('question')
                    .setDescription('Question for the 8 ball')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        let question = <string>interaction.options.getString('question');

        if (!question.includes('?')) question += '?';

        const { url } = await this.client.nekos.sfw.eightBall({ text: question });

        const embed = this.client.util.embed()
            .setTitle(question)
            .setImage(<string>url);

        interaction.reply({ embeds: [embed] });
    }
}