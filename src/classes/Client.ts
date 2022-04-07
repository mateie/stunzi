const { TOKEN } = process.env;
import { Client as DiscordClient, Collection, Guild, VoiceChannel } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import modals from '@mateie/discord-modals';
import NekoClient from 'nekos.life';

import CommandHandler from './handlers/CommandHandler';
import MenuHandler from './handlers/MenuHandler';
import EventHandler from './handlers/EventHandler';

import Cards from './Cards';
import Cypher from './Cypher';
import Cloudinary from './Cloudinary';
import Database from './Database';
import Music from './systems/Music';
import Util from './Util';
import XP from './systems/XP';

import Blocks from './moderation/Blocks';
import Mutes from './moderation/Mutes';
import Update from './moderation/Update';
import Warns from './moderation/Warns';

import Minecraft from './games/Minecraft';
import Valorant from './games/Valorant';

import ICommand from '../interfaces/ICommand';
import IMenu from '../interfaces/IMenu';
import IMineCommand from '../interfaces/IMineCommand';

export default class Client extends DiscordClient {
    readonly owners: string[];

    commands: Collection<String, ICommand>;
    menus: Collection<String, IMenu>;
    minecraftCommands: Collection<String, IMineCommand>;
    tempCreateVC: Collection<string, VoiceChannel>;

    commandHandler: CommandHandler;
    menuHandler: MenuHandler;
    eventHandler: EventHandler;

    cards: Cards;
    cypher: Cypher
    cloudinary: Cloudinary;
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

    minecraft: Minecraft;
    valorant: Valorant;

    mainGuild!: Guild;

    constructor() {
        super({ intents: 32767 });

        this.owners = ['401269337924829186', '190120411864891392'];

        this.commands = new Collection();
        this.menus = new Collection();
        this.minecraftCommands = new Collection();
        this.tempCreateVC = new Collection();

        this.commandHandler = new CommandHandler(this);
        this.menuHandler = new MenuHandler(this);
        this.eventHandler = new EventHandler(this);

        this.cards = new Cards(this);
        this.cypher = new Cypher(this);
        this.cloudinary = new Cloudinary(this);
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

        this.minecraft = new Minecraft(this);
        this.valorant = new Valorant(this);

        this.login(TOKEN);
    }

    async init(): Promise<void> {
        await this.eventHandler.load();
        await this.commandHandler.load();
        await this.menuHandler.load();
        await this.music.loadEvents();

        await this.minecraft.loadEvents();
        await this.minecraft.loadCommands();
    }

    async deploy() {
        const clientId = <string>this.user?.id;
        const guild = this.mainGuild;
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