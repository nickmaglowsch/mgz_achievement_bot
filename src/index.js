const Discord = require('discord.js');
const { token, connectionString } = require('../config.json');
const sequelize = require('./Database');
const client = new Discord.Client({ intents: ['DIRECT_MESSAGES', 'GUILD_MESSAGES'] });

client.once('ready', async () => {
    await assertDatabaseConnectionOk();
    console.log('Ready!');
});

client.on("message", async msg => {

    const { command, paramsTratados } = tratarMensagem(msg);

    if (!command) return;

    try {
        const commandFile = require(`./commands/${command}.js`);
        commandFile.run(client, msg, paramsTratados);
    } catch (err) {
        msg.channel.send("Ta tentando falar comigo? Manda um .a help que eu te ajudo");
        console.log(`(${command}) Error: ${err}`);
        console.log(err)
    }
})

function tratarMensagem(msg) {

    const returnError = { command: undefined };

    if (msg.author.bot) return returnError;
    if (msg.channel.type === "dm") return returnError;

    const mensagem = msg.toString();

    if (!mensagem) return returnError;

    const [a, command, ...params] = mensagem.split(" ");
    if (!a.includes('.a')) return returnError;

    const paramsTratados = tratarParams(params);

    return { command, paramsTratados };
}

client.login(token);

function tratarParams(params) {
    if (!params) return;

    return params
        .join(" ")
        .split("/")
        .map(param => param.trim());
}

async function assertDatabaseConnectionOk() {
    console.log(`Checking database connection...`);
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connection OK!');
    } catch (error) {
        console.log('Unable to connect to the database:');
        console.log(error.message);
        process.exit(1);
    }
}

