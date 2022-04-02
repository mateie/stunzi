import { Guild } from "discord.js";
import Client from "@classes/Client";
import Database from "@classes/Database";

export default class Verify {
    readonly client: Client;
    readonly database: Database;

    constructor(client: Client, database: Database) {
        this.client = client;
        this.database = database;
    }

    members(guild: Guild): void {
        guild.members.cache.forEach(async member => {
            const exists = await this.database.check.member(member);
            if (exists) return;
            this.database.create.member(member);
        });
    }

    guilds(): void {
        this.client.guilds.cache.forEach(async guild => {
            const exists = await this.database.check.guild(guild);
            if (exists) return;
            this.database.create.guild(guild);
        });
    }
}