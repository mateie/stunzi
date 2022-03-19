import { ButtonInteraction, Guild, GuildMember, GuildMemberRoleManager, Role } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import IEvent from "../../../classes/interfaces/IEvent";
import games from '../../../data/games';
import roles from '../../../data/roles';

export default class GameRolesEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'interactionCreate';
    }

    run(interaction: ButtonInteraction): void {
        if (!interaction.isButton()) return;

        const { customId } = interaction;
        const guild = <Guild>interaction.guild;
        const member = <GuildMember>interaction.member;

        if (!games.map(game => `${game}_role`).includes(customId)) return;

        const role = <Role>guild.roles.cache.get(roles.games[customId as keyof typeof roles.games]);

        if (!member.roles.cache.has(role.id)) {
            member.roles.remove(role);

            interaction.reply({ content: `${role} was removed from you :<`, ephemeral: true });
        } else {
            member.roles.add(role);

            interaction.reply({ content: `${role} was added to you :<`, ephemeral: true });
        }

    }
}