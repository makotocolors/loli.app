# loli.app
***A simple and quick way to filter your codes!***

```bash
npm install loli.app@latest
```

### Introduction:
This module provides a quick and easy way to run your code separated into folders based on **[discord.js](https://github.com/discordjs/discord.js)** events. Therefore, it is mandatory to provide the discord.js client, or any compatible client, as a parameter for the code to run.
However, we purposely do not limit the use exclusively to the discord.js client, so you can provide the client of other modules, such as **[eris](https://github.com/abalabahaha/eris)** or **[guilded.js](https://github.com/zaida04/guilded.js)**, we do not guarantee that anything other than the discord.js client will work, use it at your own risk.
Need help even after reading the documentation? Join our **[support server](https://discord.gg/sEXMV36WDW)** on **Discord**.
## Basic setup:
### Setting up the discord.js client.
As mentioned in the introduction of this documentation, you need to provide the Discord.js client, or any other supported client, as a parameter for this module to work. So here's a way to get the discord.js client and configure it to send it as a parameter:
```js
const { Client } = require('discord.js');
const client = new Client(/*Your options here.*/);
client.login(/*Your token here.*/);
```
### Setting up the loli.db application.
The value assigned to the "**client**" constant above will be passed as a parameter in the following code. In the following code, there is a brief example of how to select different code folders for specific events:
```js
const Application = require('loli.app');
const app = new Application(client);

// Specifying command folder.
app.on('messageCreate', './code folder/');

/* It is possible to create an events folder for
all events available in discord.js. For example: */
app.on('ready', './a different code folder/but this time it is inside another folder/');

app.on('error', './also a different code folder/inside a folder/that is inside another folder/');
```

## Basic usage:
### How to set up codes?
After following the guide above to set up loli.app, below you will see how to run the codes. When defining a folder, you can put any file in it, but only files with "**.js**" at the end of the name, and the "**code**" property (default property name) will be executed. For example:
"**./code folder/random code file.js**"
```js
module.exports = {
  name: "Ping", // Just an *optional* property defining the code name for organizational reasons.
  code: (message) => {
    if (message.content.toLowerCase() === '!ping') {
      return message.reply('Pong!');
    };
  }
};
```
You can choose to simplify the code as follows, but for aesthetic reasons we do not recommend it:
```js
module.exports = code = (message) => {
  if (message.content.toLowerCase() === '!ping') {
    return message.reply('Pong!');
  };
};
```
For both examples above, the result will be the same. This:

![image](https://files.catbox.moe/jw0164.png)

You can create infinite folders and subfolders with code files, all of them will be recognized by loli.app, but only codes ending in ".js" in the name and with the "code" property will be executed.
### How to send extra parameters to codes?
To send extra parameters to your codes, you need to go back to your main file (usually the "**index.js**" file), and inside the **on()** event of loli.app call a callback and then the **set()** function that is inside this callback. All the parameters sent inside this function will be sent back to your codes. For example:
```js
const { Client, EmbedBuilder } = require('discord.js');
const client = new Client(/*Your options here.*/);
client.login(/*Your token here.*/);

const Application = require('loli.app');
const app = new Application(client);

app.on('messageCreate', './code folder/' code => {
  code.set(client, EmbedBuilder);
/* You can send infinite parameters to the set() function,
all of them will be sent back to your codes. */
});
```
Below is an example of how to receive each parameter individually in your codes:
```js
module.exports = {
  name: 'Mention',
  code: (message, client, EmbedBuilder) => {
    const id = message.content.match(/^<@!?(\d+)>$/)?.[1];
    if (id !== client.user.id) return;

    const embed = new EmbedBuilder()
      .setTitle('Imagine a creative title.')
      .setDescription('Now imagine a creative description.');
    
    return message.reply({
      content: 'And finally, imagine creative content.',
      embeds: [embed]
    });
  }
};
```
For the example above, the result will be this:

![image](https://files.catbox.moe/gxn0s4.png)

> **Made with ❤️ by Makoto Colors!**