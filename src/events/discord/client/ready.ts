import { PresenceData } from "discord.js";
import Client from "../../../classes/Client";
import CommandEvent from "../../../classes/interfaces/CommandEvent";

export default class ReadyEvent implements CommandEvent {
    client: Client;
    name: string;
    once: boolean;

    constructor(client: Client) {
        this.client = client;

        this.name = 'ready';
        this.once = true;
    }

    async run(): Promise<void> {
        console.log(`Ready! Logged in as ${this.client.user?.tag}`);
        const guild = this.client.guilds.cache.first();

        const activities: PresenceData[] = [
            {
                status: 'dnd',
                activities: [
                    { name: 'TypeScript', type: 'LISTENING' }
                ]
            },
            {
                status: 'online',
                activities: [
                    { name: 'S&B', type: 'LISTENING' }
                ]
            }
        ];

        setInterval(() => {
            const randomIndex: number = Math.floor(Math.random() * activities.length);
            const activity: PresenceData = activities[randomIndex];
            this.client.user?.setPresence(activity);
        }, 10000);

        this.client.commandHandler.deploy();
    }
}