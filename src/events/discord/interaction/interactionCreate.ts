import { CommandInteraction, GuildMember, Guild } from "discord.js";
import Client from "../../../classes/Client";
import Command from "../../../classes/interfaces/Command";
import CommandEvent from "../../../classes/interfaces/CommandEvent";

export default class InteractionCreate implements CommandEvent {
    name: string;
    client: Client;

    constructor(client: Client) {
        this.client = client;

        this.name = 'interactionCreate';
    }

    async run(interaction: CommandInteraction): Promise<void> {
        const commandName: string = interaction.commandName;
        const member: GuildMember = <GuildMember>interaction.member;
        const Guild: Guild = <Guild>interaction.guild;

        if (interaction.isCommand()) {
            const command: Command = <Command>this.client.commands.get(commandName);
            if (!command) {
                this.client.commands.delete(commandName);
                return interaction.reply({ content: 'An error occurred' })
            }

            command.run(interaction);
        }
    }
}