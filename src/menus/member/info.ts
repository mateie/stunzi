import { ContextMenuInteraction, Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Menu from '@classes/Menu';
import IMenu from '@interfaces/IMenu';

export default class MemberMenu extends Menu implements IMenu {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('Member Info')
            .setType(2);
    }

    async run(interaction: ContextMenuInteraction) {
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>await guild.members.fetch(interaction.targetId);

        if (member.user.bot) return interaction.reply({ content: `${member} is a bot`, ephemeral: true });

        return this.client.util.memberInfo(interaction, member);
    }
}