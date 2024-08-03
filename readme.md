# loli.app
***A simple and quick way to filter and run your codes!***

```
npm i loli.app
```

### Introduction:
This module provides a simple and quick way to filter and run your codes separated into directories based on **[discord.js](https://github.com/discordjs/discord.js)** events. Therefore, it is necessary to provide the discord.js client, or any other compatible client, as a parameter for the module to work properly.
However, we purposely do not limit the use exclusively to the discord.js client, so you can provide the client of other modules, such as **[eris](https://github.com/abalabahaha/eris)** or **[guilded.js](https://github.com/zaida04/guilded.js)**. We do not guarantee that anything other than the discord.js client will work, use it at your own risk.

Need help even after reading the documentation? Join our **[support server](https://discord.gg/sEXMV36WDW)** on **Discord**.
## Basic setup:
### Setting up the discord.js client.
As mentioned in the introduction of this documentation, you need to provide the Discord.js client, or any other compatible client, as a parameter for this module to work properly. So here is a quick guide on how to get the discord.js client and configure it to send it as a parameter:
```js
const { Client } = require('discord.js');
const client = new Client(/*Your options*/);
client.login(/*Your token*/);
```
### Setting up the loli.app application.
The value assigned to the "**client**" constant above will be passed back as a parameter in the following code. And then, in the following code, there is a brief example of how to specify different directories for your code in specific events:
```js
const Application = require('loli.app');
const app = new Application(client);

/* Specifying an event and then a directory for the code
that will be executed when the event is triggered. */
app.on('messageCreate', './directory/');

// It is possible to create a different directory for each event.
app.on('ready', './another directory/with another directory inside/');

app.on('error', './a directory/inside of a directory/inside of another directory/');
```

## Basic usage:
### How to set up my codes?
Below you will understand how to organize your codes so that they are executed correctly. When defining a directory, you can insert any files in it, however only files ending in "**.js**" in their name, and the "**code**" property (can be changed) in their structure will be properly executed, any other file that does not meet these two requirements will be ignored by the module. For example:

"**./directory/random code file.js**"
```js
module.exports = {
  name: "ping", // An *optional* property that exists only for organizational reasons.
  code: (message) => {
    if (message.content.toLowerCase() === '!ping') {
      return message.reply('Pong!');
    };
  }
};
```
The previous code can be simplified as follows, however we do not recommend it for aesthetic reasons:
```js
module.exports = code = (message) => {
  if (message.content.toLowerCase() === '!ping') {
    return message.reply('Pong!');
  };
};
```
For both examples above, the result will be the same. This:

![image](https://files.catbox.moe/jw0164.png)

You can create infinite directories and subdirectories with your code files, however only files ending in "**.js**" in their name, and the "**code**" property in their structure will be properly executed.
### How to send additional parameters to my codes?
To send additional parameters to your code, you need to go back to your main file (usually the "**index.js**" file), and inside the **on()** event of loli.app call a callback and then the **set()** function that is inside that callback. All the parameters sent inside that function will be sent back to your code. For example:
```js
const { Client, EmbedBuilder } = require('discord.js');
const client = new Client(/*Your options*/);
client.login(/*Your token*/);

const Application = require('loli.app');
const app = new Application(client);

app.on('messageCreate', './directory/', (code) => {
  code.set(client, EmbedBuilder);
/* You can send infinite parameters to the set() function,
all of them will be sent back to your codes. */
});
```
Below is an example of how to receive each parameter individually in your codes:
```js
module.exports = {
  name: 'mention',
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