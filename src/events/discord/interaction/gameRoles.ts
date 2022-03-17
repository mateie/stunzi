import { ButtonInteraction, Guild, GuildMember, Role } from "discord.js";
import Client from "../../../classes/Client";
import ButtonEvent from "../../../classes/interfaces/ButtonEvent";
import games from '../../../data/games';
import roles from '../../../data/roles';

export default class GameRolesEvent implements ButtonEvent {
    client: Client;
    name: string;

    constructor(client: Client) {
        this.client = client;

        this.name = 'interactionCreate';
    }

    run(interaction: ButtonInteraction): void {
        if (!interaction.isButton()) return;

        const customId: string = interaction.customId;
        const member: GuildMember = <GuildMember>interaction.member;
        const guild: Guild = <Guild>interaction.guild;

        if (!games.map(game => `${game}_role`).includes(customId)) return;

        const role: Role = <Role>guild.roles.cache.get(roles.games[customId as keyof typeof roles.games]);

        if (member.roles.cache.has(role.id)) {
            member.roles.remove(role);

            interaction.reply({ content: `${role} was removed from you :<`, ephemeral: true });
        } else {
            member.roles.add(role);

            interaction.reply({ content: `${role} was added to you :<`, ephemeral: true });
        }

    }
}