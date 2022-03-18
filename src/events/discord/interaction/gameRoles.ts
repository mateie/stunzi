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

        const { member, guild, customId } = interaction;

        if (!games.map(game => `${game}_role`).includes(customId)) return;

        const role: Role = <Role>guild?.roles.cache.get(roles.games[customId as keyof typeof roles.games]);

        const memberRoles = <GuildMemberRoleManager>member?.roles;
        if (memberRoles.cache.has(role.id)) {
            memberRoles.remove(role);

            interaction.reply({ content: `${role} was removed from you :<`, ephemeral: true });
        } else {
            memberRoles.add(role);

            interaction.reply({ content: `${role} was added to you :<`, ephemeral: true });
        }

    }
}