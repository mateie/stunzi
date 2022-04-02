import Client from "@classes/Client";

import { ValClient } from "valclient.js";
import { GuildMember } from "discord.js";
import { Regions } from "valclient.js/dist/cjs/types/resources";

export default class Valorant {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async login(member: GuildMember, username: string, password: string, region: Regions) {
        const auth = new ValClient();

        try {
            await auth.init({
                auth: {
                    username,
                    password
                },
                region,
            });

            this.client.valorantAuth.set(member.id, auth);
            return true;
        } catch (err: any) {
            console.error(err);
            return false;
        }
    }
}