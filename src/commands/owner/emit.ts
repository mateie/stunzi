import { CommandInteraction, GuildMember } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../interfaces/ICommand";

export default class EmitCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.permission = 'ADMINISTRATOR';
        this.data
            .setName('emit')
            .setDescription('Event Emitter')
            .addStringOption(option =>
                option
                    .setName('member')
                    .setDescription('Guild Member')
                    .addChoices([
                        ['Member Joining', 'guildMemberAdd'],
                        ['Member Leaving', 'guildMemberRemove']
                    ])
                    .setRequired(true)
            );

    }

    run(interaction: CommandInteraction): void {
        const choices: string = <string>interaction.options.getString('member');
        const member = <GuildMember>interaction.member;
        switch (choices) {
            case 'guildMemberAdd':
                this.client.emit('guildMemberAdd', member);
                break;
            case 'guildMemberRemove':
                this.client.emit('guildMemberRemove', member);
                break;
        }

        interaction.reply({ content: 'Emitted', ephemeral: true });
    }
}