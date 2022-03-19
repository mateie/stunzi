import { GuildMember, Guild as DiscordGuild } from "discord.js";
import Guild, { IGuild } from "../../schemas/Guild";
import Member, { IMember } from "../../schemas/Member";
import Client from "../Client";
import Database from "../Database";

export default class Create {
    client: Client;
    database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async member(member: GuildMember): Promise<IMember | void> {
        return await Member.create({
            id: member.id,
            username: member.user.username,
        })
            .then(() => console.log(`Member added to the database (ID: ${member.id} - Name: ${member.user.tag})`))
            .catch(console.error);
    }

    async guild(guild: DiscordGuild): Promise<IGuild | void> {
        return await Guild.create({
            id: guild.id,
            name: guild.name
        })
            .then(() => console.log(`Member added to the database (ID: ${guild.id} - Name: ${guild.name})`))
            .catch(console.error)
    }
}