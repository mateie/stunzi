import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { Regions } from "valclient.js/dist/cjs/types/resources";
import Client from "@classes/Client";
import Command from "@classes/Command";
import ICommand from "@interfaces/ICommand";
import { CurrentOffersResponse, ValClient } from "valclient.js";
import { LoadoutResponse } from "valclient.js/dist/cjs/interfaces/loadout";
import { guns, GunsType, SkinsType } from "valclient.js/dist/cjs/types/loadout";

export default class ValorantCommand extends Command implements ICommand {
    weapons: [name: string, value: string][];

    constructor(client: Client) {
        super(client);

        this.weapons = guns.map(gun => [gun, gun]);

        this.data
            .setName('valorant')
            .setDescription('Valorant Stuff')
            .addSubcommandGroup(group =>
                group
                    .setName('account')
                    .setDescription('Manage your valorant account')
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('login')
                            .setDescription('Login to your valorant account (WE DO NOT KEEP ANY INFORMATION)')
                            .addStringOption(option =>
                                option
                                    .setName('username')
                                    .setDescription('Your Valorant Username')
                                    .setRequired(true)
                            )
                            .addStringOption(option =>
                                option
                                    .setName('password')
                                    .setDescription('Your Valorant Password (WE DO NOT STORE IT)')
                                    .setRequired(true)
                            )
                            .addStringOption(option =>
                                option
                                    .setName('region')
                                    .setDescription('Specify which region you are in')
                                    .addChoices([
                                        ['NA', 'na'],
                                        ['EU', 'eu'],
                                        ['AP', 'ap'],
                                        ['KR', 'kr']
                                    ])
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('store')
                            .setDescription('Your Valorant Store')
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('wallet')
                            .setDescription('Your Valorant Wallet (VP, Radianite, etc)')
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('logout')
                            .setDescription('Logout from your account')
                    )
            )
            .addSubcommandGroup(group =>
                group
                    .setName('loadout')
                    .setDescription('Manage your Valorant loadout')
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('view')
                            .setDescription('View your current valorant loadout')
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('change')
                            .setDescription('Change your weapon skin')
                            .addStringOption(option =>
                                option
                                    .setName('weapon')
                                    .setDescription('Which weapon do you want to change skin for?')
                                    .addChoices(this.weapons)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('default')
                            .setDescription('Change your weapon skin to default')
                            .addStringOption(option =>
                                option
                                    .setName('weapon')
                                    .setDescription('Which weapon do you want to change to default?')
                                    .addChoices(this.weapons)
                                    .setRequired(true)
                            )
                    )
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        const member = <GuildMember>interaction.member;
        if (member.id !== this.client.owners[0]) return interaction.reply({ content: 'This command is disabled for now', ephemeral: true });
        const subcommandGroup = options.getSubcommandGroup();
        const subcommand = options.getSubcommand();
        const valorant = <ValClient>this.client.valorant.accounts.get(member.id);
        if (subcommand !== 'login' && !valorant) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
        switch (subcommandGroup) {
            case 'account': {
                switch (subcommand) {
                    case 'login': {
                        const username = <string>options.getString('username')?.toLowerCase();
                        const password = this.client.cypher.encrypt(<string>options.getString('password'));
                        const region = <Regions>options.getString('region');

                        const success = await this.client.valorant.login(member, username, password, region);
                        if (success == true) return interaction.reply({ content: 'Logged in successfully', ephemeral: true });
                        else {
                            return interaction.reply({ content: success.message, ephemeral: true });
                        }
                        break;
                    }
                    case 'store': {
                        const store = <CurrentOffersResponse>await valorant.store?.currentOffers();
                        return this.client.valorant.util.skinsEmbed(interaction, store);
                    }
                    case 'wallet': {
                        const wallet = await valorant.store?.wallet();
                        return interaction.reply({ content: `**VP**: ${wallet?.valorant_points}\n**Radianite**: ${wallet?.radianite_points}`, ephemeral: true });
                    }
                    case 'logout': {
                        this.client.valorant.accounts.delete(member.id);
                        return interaction.reply({ content: 'Logged out', ephemeral: true });
                    }
                }
                break;
            }
            case 'loadout': {
                switch (subcommand) {
                    case 'view': {
                        const loadout = <LoadoutResponse>await valorant.loadout?.current();
                        return this.client.valorant.util.inventoryEmbed(interaction, loadout);
                    }
                    case 'change': {
                        const weapon = <string>options.getString('weapon');
                        return this.client.valorant.changeSkin(interaction, weapon, valorant);
                    }
                    case 'default': {
                        const weapon = <GunsType>options.getString('weapon');
                        const defaultSkin = `Standard ${weapon}`;
                        valorant.loadout?.changeGunSkin(weapon, <SkinsType<GunsType>>defaultSkin, 'Level 1', 'Default');
                        return interaction.reply({ content: `Set ${weapon} to default`, ephemeral: true });
                    }
                }
            }
        }

    }
}
