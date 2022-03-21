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

    async member(member: GuildMember): Promise<IMember> {
        const dbMember = await Member.findOne({ id: member.id });
        if (!dbMember) return await this.database.create.member(member);
        return <IMember><unknown>dbMember;
    }

    async allMembers(): Promise<Array<IMember>> {
        const members = await Member.find();
        return members;
    }

    async guild(guild: DiscordGuild): Promise<IGuild> {
        const dbGuild = await Guild.findOne({ id: guild.id });
        if (!dbGuild) return await this.database.create.guild(guild);
        return <IGuild><unknown>dbGuild;
    }

    async allGuilds(): Promise<Array<IGuild>> {
        const guilds = await Guild.find();
        return guilds;
    }
}