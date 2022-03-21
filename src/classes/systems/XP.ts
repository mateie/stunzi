import { GuildMember } from "discord.js";
import { IMember } from "../../schemas/Member";
import Client from "../Client";

export default class XP {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async giveXP(member: GuildMember, amount: number = 1) {
        const dbMember = await this.client.database.get.member(member);

        dbMember.xp += amount;
        await dbMember.save();
    }

    async getXP(member: GuildMember): Promise<number> {
        const dbMember = await this.client.database.get.member(member);

        return dbMember.xp;
    }

    calculateLevel(xp: number): number {
        return Math.floor(0.1 * Math.sqrt(xp));
    }

    calculateXPForLevel(level: number): number {
        let xp = 0;
        let currentLevel = 0;

        while (currentLevel != level) {
            xp++;
            currentLevel = this.calculateLevel(xp);
        }

        return xp;
    }

    calculateReqXP(xp: number) {
        let currentLevel = this.calculateLevel(xp);
        const nextLevel = this.calculateLevel(xp) + 1;

        let neededXP = 0;
        while (currentLevel < nextLevel) {
            neededXP++;
            currentLevel = this.calculateLevel(xp + neededXP);
        }

        return neededXP;
    }
}