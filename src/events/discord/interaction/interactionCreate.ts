import { CommandInteraction, GuildMember, Guild } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import Command from "../../../classes/interfaces/ICommand";
import IEvent from "../../../classes/interfaces/IEvent";

export default class InteractionCreate extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

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