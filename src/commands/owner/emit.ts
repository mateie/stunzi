import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/interfaces/Command";

export default class EmitCommand implements Command {
    client: Client;
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

    constructor(client: Client) {
        this.client = client;

        this.data = new SlashCommandBuilder()
            .setName('emit')
            .setDescription('Event Emitter')
            .addStringOption((option: SlashCommandStringOption) =>
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
        const member: GuildMember = <GuildMember>interaction.member;
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