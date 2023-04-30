const { Client, resolveColor } = require("discord.js"),
    { writeFileSync, readFileSync } = require("fs"),
    { prefix, token, owners } = require("./config"),
    database = JSON.parse(readFileSync("./data.db")),
    client = new Client({
        intents: 3276799
    });

client.login(token);
process.on("unhandledRejection", (e) => console.error(e));
process.on("uncaughtException", (e) => console.error(e));
function writeDatabase() {
    writeFileSync("./data.db", JSON.stringify(database));
}
client.on("ready", () => {
    console.log(`Bot backup émoji connecté en tant que ${client.user.tag}!\nPowered by Nova World!`)
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args[0]?.toLowerCase();
    args.shift();

    if (command === "load") {
        if (!owners.includes(message.author.id)) return message.channel.send(`Zut! Il semblerait que tu n'es pas autorisé à utiliser cette commande!`);
        const id = args[0];
        if (!id) return message.channel.send(`Zut! Il semblerait que tu n'es pas spécifié l'ID de la backup!`);
        if (!database[id]) return message.channel.send(`Zut! Il semblerait que cette backup n'existe pas!`);

        let embed = {
            title: "Vous allez load la backup suivante:",
            description: `ID: \`${id}\`\nEmojis: ${database[id].length}\n**Souhaitez vous effacer tous les émojis actuels ?**`,
            color: resolveColor("Yellow"),
            timestamp: new Date(),
        };
        let components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3,
                        label: "Oui",
                        custom_id: "oui",
                    },
                    {
                        type: 2,
                        style: 4,
                        label: "Non",
                        custom_id: "non",
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        label: "Annuler",
                        custom_id: "annuler",
                    }
                ]
            }
        ]
        let msg = await message.channel.send({ embeds: [embed], components });
        let response = await msg.awaitMessageComponent({
            filter: (i) => i.user.id === message.author.id,
            time: 120000
        });
        if (response.customId === "annuler") msg.delete().catch(() => { });
        if (response.customId === "oui") {
            msg.edit({
                embeds: [
                    {
                        description: "Suppression des émojis en cours...",
                        color: resolveColor("Yellow"),
                        timestamp: new Date(),
                    }
                ],
                components: []
            })
            await Promise.all(message.guild.emojis.cache.map((e) => e.delete()));
        }
        msg.edit({
            embeds: [
                {
                    description: "Création des émojis en cours...",
                    color: resolveColor("Yellow"),
                    timestamp: new Date(),
                }
            ],
            components: []
        })
        for await (const emoji of database[id]) {
            await message.guild.emojis.create({
                name: emoji.name,
                attachment: `https://cdn.discordapp.com/emojis/${emoji.url}`,
            });
        }
        msg.edit({
            embeds: [
                {
                    description: "Backup chargée avec succès!",
                    color: resolveColor("Yellow"),
                    timestamp: new Date(),
                }
            ]
        })
    } else if (command === "create") {
        if (!owners.includes(message.author.id)) return message.channel.send(`Zut! Il semblerait que tu n'es pas autorisé à utiliser cette commande!`);
        let emojis = await message.guild.emojis.fetch();
        let backup = emojis.map((e) => {
            return {
                name: e.name,
                url: `${e.id}.${e.animated ? "gif" : "png"}`,
            }
        });
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        database[id] = backup;
        writeDatabase();
        let embed = {
            title: "Backup créée!",
            description: `ID: \`${id}\`\nEmojis: ${backup.length}`,
            color: resolveColor("Yellow"),
            timestamp: new Date(),
            footer: { text: "Powered by Nova World! - discord.gg/novaworld" }
        }
        message.channel.send({ embeds: [embed] });
    } else if (command === "remove") {
        if (!owners.includes(message.author.id)) return message.channel.send(`Zut! Il semblerait que tu n'es pas autorisé à utiliser cette commande!`);
        const id = args[0];
        if (!id) return message.channel.send(`Zut! Il semblerait que tu n'es pas spécifié l'ID de la backup!`);
        if (!database[id]) return message.channel.send(`Zut! Il semblerait que cette backup n'existe pas!`);
        delete database[id];
        writeDatabase();
        let embed = {
            title: "Backup supprimée!",
            description: `ID: \`${id}\``,
            color: resolveColor("Yellow"),
            timestamp: new Date(),
            footer: { text: "Powered by Nova World! - discord.gg/novaworld" }
        }
        message.channel.send({ embeds: [embed] });
    } else if (command === "list") {
        if (!owners.includes(message.author.id)) return message.channel.send(`Zut! Il semblerait que tu n'es pas autorisé à utiliser cette commande!`);
        let embed = {
            title: "Liste des backups:",
            description: Object.keys(database).map((e) => `\`${e}\` - ${database[e].length}`).join("\n"),
            color: resolveColor("Yellow"),
            timestamp: new Date(),
            footer: { text: "Powered by Nova World! - discord.gg/novaworld" }
        }
        message.channel.send({ embeds: [embed] });
    } else if (command === "help") {
        let embed = {
            title: "Help",
            footer: { text: "Powered by Nova World! - discord.gg/novaworld" },
            color: resolveColor("Yellow"),
            timestamp: new Date(),
            fields: [
                {
                    name: `\`${prefix}create\``,
                    value: "Créer une backup de tous les émojis du serveur",
                },
                {
                    name: `\`${prefix}load <id>\``,
                    value: "Charger une backup",
                },
                {
                    name: `\`${prefix}remove <id>\``,
                    value: "Supprimer une backup",
                },
                {
                    name: `\`${prefix}list\``,
                    value: "Lister toutes les backups",
                },
                {
                    name: `\`${prefix}help\``,
                    value: "Ce que vous lisez",
                }
            ]
        }
        message.channel.send({ embeds: [embed] })
    }
})