const { TOKEN } = process.env;
import { Client as DiscordClient, Collection, Guild } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
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
import IMenu from './interfaces/IMenu';

export default class Client extends DiscordClient {
    owners: string[];

    commands: Collection<String, ICommand>;
    menus: Collection<String, IMenu>;
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

    async deploy() {
        const clientId = <string>this.user?.id;
        const guild = <Guild>this.guilds.cache.first();
        const allCommands = this.commands;
        const allMenus = this.menus;
        const token: string = <string>this.token;

        const body: any[] = [];

        allCommands.forEach((command: ICommand) => {
            body.push(command.data.toJSON());
        });

        allMenus.forEach((menu: IMenu) => {
            body.push(menu.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.info('Pushing Application Commands to REST');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guild.id),
                { body }
            )
                .then(async (commands: any) => {
                    commands = commands.filter((c: any) => c.type == 1);
                    const Roles = (commandName: string) => {
                        const cmdPerms = this.commands.get(commandName)?.permission;
                        if (!cmdPerms) return null;

                        return guild.roles.cache.filter(r => r.permissions.has(cmdPerms));
                    }

                    const fullPermissions = commands.reduce((accum: any, r: any) => {
                        const roles = Roles(r.name);
                        if (!roles) return accum;

                        const permissions = roles.reduce((a: any, r: any) => {
                            return [...a, { id: r.id, type: 'ROLE', permission: true }];
                        }, []);

                        return [...accum, { id: r.id, permissions }];
                    }, []);

                    await guild.commands.permissions.set({ fullPermissions });
                })
                .catch(console.error)

            console.info('Pushed Application Commands to REST');
        } catch (err) {
            console.error(err);
        }
    }
}