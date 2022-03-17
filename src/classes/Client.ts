const { TOKEN, STEALTH, BUNZI } = process.env;
import { Client as DiscordClient, Collection } from 'discord.js';
import moment from 'moment';

import CommandHandler from './handlers/CommandHandler';
import EventHandler from './handlers/EventHandler';

import Util from './Util';

export default class Client extends DiscordClient {
    owners: (string | undefined)[];

    commands: Collection<String, Object>;
    menus: Collection<String, Object>;
    moment: typeof moment;

    commandHandler: CommandHandler;
    eventHandler: EventHandler;

    util: Util;

    constructor() {
        super({ intents: 32767 });

        this.owners = [STEALTH, BUNZI];

        this.commands = new Collection();
        this.menus = new Collection();
        this.moment = moment;

        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);

        this.util = new Util(this);

        this.login(TOKEN);
    }

    async init(): Promise<void> {
        await this.eventHandler.load();
        await this.commandHandler.load();
    }
}