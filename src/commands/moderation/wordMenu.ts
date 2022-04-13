import { ContextMenuInteraction, Message, TextChannel } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/Menu';
import IMenu from '@interfaces/IMenu';

export default class WordMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.permission = 'MANAGE_MESSAGES';
        this.data
            .setName('Add to the Whitelist')
            .setType(3);
    }

    async run(interaction: ContextMenuInteraction) {
        const { targetId } = interaction;

        const channel = <TextChannel>interaction.channel;
        const message = <Message>await channel.messages.fetch(targetId);

        console.log(message);
    }
}