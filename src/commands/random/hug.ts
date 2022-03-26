import { CommandInteraction, GuildMember } from 'discord.js';
import Client from '../../classes/Client';
import Command from '../../classes/Command';
import ICommand from '../../classes/interfaces/ICommand';

export default class HugCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('hug')
            .setDescription('Hug someone')
            .addUserOption(option =>
                option
                    .setName('person')
                    .setDescription('Who do you wanna hug? :>')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;

        const member = <GuildMember>interaction.member;
        const person = <GuildMember>options.getMember('person');

        try {
            const { url } = await this.client.nekos.sfw.hug();

            const embed = this.client.util.embed()
                .setImage(url)
                .setTitle(`${member.user.username} hugged ${person.user.username}`);

            if ((member.id === this.client.owners[0] && person.id === this.client.owners[1]) || (member.id === this.client.owners[1] && person.id === this.client.owners[0])) embed.setTitle(`${member.user.username} hugged ${person.user.username} :purple_heart:`);

            interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            interaction.reply({ content: `Couldn\'t hug ${person}`, ephemeral: true });
        }
    }
}