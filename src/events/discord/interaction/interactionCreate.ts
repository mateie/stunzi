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
        const { commandName } = interaction;
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;
        if (interaction.type == 'APPLICATION_COMMAND') {
            const isBlocked = await this.client.blocks.isBlocked(member);
            if (isBlocked) {
                const block = await this.client.blocks.get(member);
                const by = <GuildMember>guild.members.cache.get(block.by);
                return interaction.reply({ content: `You have been blocked by ${by} from using commands`, ephemeral: true });
            }
        }

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