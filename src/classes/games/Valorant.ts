import Client from "../Client";

import { ValClient } from "@mateie/valclient.js";
import { GuildMember } from "discord.js";
import { Regions } from "@mateie/valclient.js/dist/cjs/types/resources";

const { RIOT_API } = process.env;

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
                    username: 'mateieatl',
                    password: 'Mateie2001'
                },
                region: 'na'
            });

            this.client.valorantAuth.set(member.id, auth);
            return true;
        } catch (err: any) {
            //console.error(err);
            return false;
        }
    }
}