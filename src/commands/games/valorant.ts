import { CommandInteraction, Guild } from "discord.js";
import Client from "../../classes/Client";
import Command from "../../classes/Command";
import ICommand from "../../classes/interfaces/ICommand";
import ValorantDB, { IValorant } from "../../schemas/ValorantDB";

export default class ValorantCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('valorant')
            .setDescription('Valorant Stuff')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('login')
                    .setDescription('Login to your valorant account')
                    .addStringOption(option =>
                        option
                            .setName('username')
                            .setDescription('Your Valorant Username')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('password')
                            .setDescription('Your Valorant Password (it will be encrypted)')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName('region')
                            .setDescription('Specify which region you are in')
                            .addChoices([
                                ['NA', 'NA'],
                                ['EU', 'EU'],
                                ['AP', 'AP'],
                                ['KR', 'KR']
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
                    .setName('inventory')
                    .setDescription('Check your valorant inventory')
            );
    }

    async run(interaction: CommandInteraction) {
        const { options } = interaction;
        const member = <any>interaction.member;
        const valorant = <any>await ValorantDB.findOne({ memberId: member.id });
        const subcommand = options.getSubcommand();
        switch (subcommand) {
            case 'login': {
                const username = <string>options.getString('username');
                const password = this.client.cypher.encrypt(<string>options.getString('password'));
                const region = <string>options.getString('region');

                if (valorant) return interaction.reply({ content: 'You are already logged in', ephemeral: true });
                await ValorantDB.create({
                    memberId: member.id,
                    username,
                    password,
                    region,
                });

                this.client.valorant.login(member);
                return interaction.reply({ content: 'Logged in', ephemeral: true });
            }
            case 'store': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const store = await member.valorant.storeApi.getStorefront(
                    member.valorant.user.Subject,
                    true,
                    'en-US'
                );

                if (!store) return interaction.reply({ content: 'Could not fetch the store, please try again', ephemeral: true });

                const { skins } = store;
                this.client.valorant.skinsEmbed(interaction, skins);
                break;
            }
            case 'wallet': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const wallet = await member.valorant.storeApi.getWallet(member.valorant.user.Subject).catch(console.error);
                if (!wallet) return interaction.reply({ content: 'Your wallet could not be fetched, please try again', ephemeral: true });
                const mapped = wallet.map((currency: { name: any; amount: any; }) => `**${currency.name}**: ${currency.amount}`);
                return interaction.reply({ content: mapped.join('\n'), ephemeral: true });
            }
            case 'inventory': {
                const isLogged = await this.client.valorant.isAuthenticated(member);
                if (!isLogged) return interaction.reply({ content: 'You are not logged in', ephemeral: true });
                if (!member.valorant) return interaction.reply({ content: 'Something went wrong, please try again', ephemeral: true });
                const inv = await member.valorant.playerApi.getInventory(member.valorant.user.Subject);
                if (!inv) return interaction.reply({ content: 'Your inventory could not be fetched, please try again', ephemeral: true });
                this.client.valorant.inventoryEmbed(interaction, inv);
                break;
            }
        }
    }
}