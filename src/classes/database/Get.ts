import { Guild as DiscordGuild, GuildMember } from "discord.js";
import Client from "../Client";
import Database from "../Database"
import Member, { IMember } from "../../schemas/Member";
import Guild, { IGuild } from "../../schemas/Guild";

export default class Get {
    client: Client;
    database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async member(member: GuildMember): Promise<IMember | void | null> {
        const dbMember = Member.findOne({ id: member.id });
        if (!dbMember) return await this.database.create.member(member);
        return dbMember;
    }

    async guild(guild: DiscordGuild): Promise<IGuild | void | null> {
        const dbGuild = Guild.findOne({ id: guild.id });
        if (!dbGuild) return await this.database.create.guild(guild);
        return dbGuild;
    }
}