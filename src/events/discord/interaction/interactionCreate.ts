import { CommandInteraction, GuildMember, Guild, TextChannel } from "discord.js";
import Client from "@classes/Client";
import Event from "@classes/Event";
import IEvent from "@interfaces/IEvent";

import ICommand from "@interfaces/ICommand";
import IMenu from "@interfaces/IMenu";

import channels from "@data/channels";

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
        const channel = <TextChannel>interaction.channel;
        if (interaction.type === 'APPLICATION_COMMAND') {
            const isBlocked = await this.client.blocks.isBlocked(member);
            if (isBlocked) {
                const block = await this.client.blocks.get(member);
                const by = <GuildMember>guild.members.cache.get(block.by);
                return interaction.reply({ content: `You have been blocked by ${by} from using commands`, ephemeral: true });
            }
        }

        if (interaction.type === 'APPLICATION_COMMAND' && commandName !== 'music' && channel.id === channels.text.music) return interaction.reply({ content: `You can only use music commands here`, ephemeral: true })

        if (interaction.isCommand()) {
            const command = <ICommand>this.client.commands.get(commandName);

            try {
                await command.run(interaction);
            } catch {
                return interaction.reply({ content: 'An error occured, try again', ephemeral: true }).catch(console.error);
            }
        }

        if (interaction.isContextMenu()) {
            const menu = <IMenu>this.client.menus.get(commandName);

            try {
                await menu.run(interaction);
            } catch {
                return interaction.reply({ content: 'An error occured, try again', ephemeral: true }).catch(console.error);
            }
        }
    }
}