import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

const colornames = require('colornames');
const isHexColor = require('is-hex-color');

export default class CardCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('card')
            .setDescription('Customize your profile card')
            .addStringOption(option =>
                option
                    .setName('element')
                    .setDescription('What do you want to customize?')
                    .setRequired(true)
                    .addChoices([
                        ['Background', 'background'],
                        ['Text', 'text'],
                        ['Progressbar', 'progressbar']
                    ])
            )
            .addStringOption(option =>
                option
                    .setName('color')
                    .setDescription('What color do you want it to be?')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>interaction.member;

        const element = <string>options.getString('element');
        const color = options.getString('color');

        let hex;

        if (!isHexColor(color)) hex = colornames(color);

        if (!hex) return interaction.reply({ content: `${color} is not a color`, ephemeral: true });

        const dbMember = await this.client.database.get.member(member);

        dbMember.card[element as keyof typeof dbMember.card] = hex;

        await dbMember.save();

        interaction.reply({ content: `Your Profile Card **${element}** was changed to **${color}**`, ephemeral: true });
    }
}