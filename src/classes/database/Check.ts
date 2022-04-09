import { Guild as DiscordGuild, GuildMember } from 'discord.js';
import Guild from '@schemas/Guild';
import Member from '@schemas/Member';
import Client from '@classes/Client';
import Database from '@classes/Database';

export default class Check {
    readonly client: Client;
    readonly database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    async member(member: GuildMember): Promise<boolean> {
        const dbMember = await Member.findOne({ id: member.id });
        if (!dbMember) return false;
        return true;
    }

    async guild(guild: DiscordGuild): Promise<boolean> {
        const dbGuild = await Guild.findOne({ id: guild.id });
        if (!dbGuild) return false;
        return true;
    }
}