import { Guild, GuildMember } from 'discord.js';
import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

const { MY_VAL_USERNAME, MY_VAL_PASSWORD } = process.env;

export default class ReadyEvent extends Event implements IEvent {
    name: string;

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
        this.client.webhookHandler.load();

        this.client.valorant.login(<GuildMember>guild.members.cache.get('401269337924829186'), <string>MY_VAL_USERNAME, this.client.cypher.encrypt(<string>MY_VAL_PASSWORD), 'na');
    
        await this.client.blocks.check(guild);
        await this.client.mutes.check(guild);
    }
}