import { Guild, TextChannel } from "discord.js";
import Client from "../../../classes/Client";
import Event from "../../../classes/Event";
import IEvent from "../../../classes/interfaces/IEvent";

export default class ReadyEvent extends Event implements IEvent {
    name: string;
    once: boolean;

    constructor(client: Client) {
        super(client);

        this.name = 'ready';
        this.once = true;
    }

    async run(): Promise<void> {
        console.log(`Ready! Logged in as ${this.client.user?.tag}`);
        const guild = <Guild>this.client.guilds.cache.first();

        this.client.database.connect();
        this.client.database.verify.members(guild);
        this.client.database.verify.guilds();

        this.client.mainGuild = guild;

        this.client.user?.setPresence({
            status: 'online',
            activities: [
                { name: 'S&B', type: 'LISTENING' }
            ]
        });

        this.client.deploy();

        guild.members.cache.filter(m => !m.user.bot).forEach((member: any) => this.client.valorant.login(member));
    }
}