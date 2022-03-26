const { TOKEN, STEALTH, BUNZI } = process.env;
import { Client as DiscordClient, Collection } from 'discord.js';
import moment from 'moment';
import modals from '@mateie/discord-modals';
import NekoClient from 'nekos.life';

import CommandHandler from './handlers/CommandHandler';
import EventHandler from './handlers/EventHandler';

import Cards from './Cards';
import Cypher from './Cypher';
import Database from './Database';
import Music from './systems/Music';
import Util from './Util';
import XP from './systems/XP';

import Blocks from './moderation/Blocks';
import Mutes from './moderation/Mutes';
import Update from './moderation/Update';
import Warns from './moderation/Warns';

import ICommand from './interfaces/ICommand';

export default class Client extends DiscordClient {
    owners: (string)[];

    commands: Collection<String, ICommand>;
    menus: Collection<String, Object>;
    moment: typeof moment;

    commandHandler: CommandHandler;
    eventHandler: EventHandler;

    cards: Cards;
    cypher: Cypher
    database: Database;
    modals: void;
    music: Music;
    nekos: NekoClient;
    util: Util;
    xp: XP;

    blocks: Blocks;
    mutes: Mutes;
    update: Update;
    warns: Warns;

    constructor() {
        super({ intents: 32767 });

        this.owners = ['401269337924829186', '190120411864891392'];

        this.commands = new Collection();
        this.menus = new Collection();
        this.moment = moment;

        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);

        this.cards = new Cards(this);
        this.cypher = new Cypher(this);
        this.database = new Database(this);
        this.music = new Music(this);
        this.modals = modals(this);
        this.nekos = new NekoClient();
        this.util = new Util(this);
        this.xp = new XP(this);

        this.blocks = new Blocks(this);
        this.mutes = new Mutes(this);
        this.update = new Update(this);
        this.warns = new Warns(this);

        this.login(TOKEN);
    }

    async init(): Promise<void> {
        await this.eventHandler.load();
        await this.commandHandler.load();
        await this.music.loadEvents();
    }
}