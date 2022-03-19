const { TOKEN, STEALTH, BUNZI } = process.env;
import { Client as DiscordClient, Collection } from 'discord.js';
import moment from 'moment';

import CommandHandler from './handlers/CommandHandler';
import EventHandler from './handlers/EventHandler';

import Cards from './Cards';
import Database from './Database';
import Util from './Util';

import ICommand from './interfaces/ICommand';

export default class Client extends DiscordClient {
    owners: (string)[];

    commands: Collection<String, ICommand>;
    menus: Collection<String, Object>;
    moment: typeof moment;

    commandHandler: CommandHandler;
    eventHandler: EventHandler;

    cards: Cards;
    database: Database;
    util: Util;

    constructor() {
        super({ intents: 32767 });

        this.owners = ['401269337924829186', '190120411864891392'];

        this.commands = new Collection();
        this.menus = new Collection();
        this.moment = moment;

        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);

        this.cards = new Cards(this);
        this.database = new Database(this);
        this.util = new Util(this);

        this.login(TOKEN);
    }

    async init(): Promise<void> {
        await this.eventHandler.load();
        await this.commandHandler.load();
    }
}