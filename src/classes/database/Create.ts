import { GuildMember, Guild as DiscordGuild } from "discord.js";
import Guild, { IGuild } from "../../schemas/Guild";
import Member, { IMember } from "../../schemas/Member";
import Client from "../Client";
import Database from "../Database";

export default class Create {
    readonly client: Client;
    readonly database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async member(member: GuildMember): Promise<IMember | void> {
        if (member.user.bot) return;

        const newMember: IMember = new Member({
            id: member.id,
            username: member.user.username
        });

        await newMember.save().catch(console.error);

        console.log(`Member added to the database (ID: ${member.id} - Name: ${member.user.tag})`);

        return newMember;
    }

    async guild(guild: DiscordGuild): Promise<IGuild> {
        const newGuild: IGuild = new Guild({
            id: guild.id,
            name: guild.name
        });

        await newGuild.save().catch(console.error);

        console.log(`Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`);

        return newGuild;
    }
}