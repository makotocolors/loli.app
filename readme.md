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
```javascript
const { Client } = require('discord.js');
const client = new Client(/*Your options*/);
client.login(/*Your token*/);
```
### Setting up the loli.app application.
The value assigned to the "**client**" constant above will be passed back as a parameter in the following code. And then, in the following code, there is a brief example of how to specify different directories for your code in specific events:
```javascript
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
```javascript
module.exports = {
  data: { // An *optional* property that exists only for organizational reasons.
    name: 'ping',
    description: 'Replies with "Pong!" when the "!ping" command is sent in the chat.'
  }, 
  code: (message) => {
    if (message.content === '!ping') {
      return message.reply('Pong!');
    };
  }
};
```
The previous code can be simplified as follows, however we do not recommend it for aesthetic reasons:
```javascript
module.exports = code = (message) => {
  if (message.content === '!ping') {
    return message.reply('Pong!');
  };
};
```
For both examples above, the result will be the same. This:

![image](https://files.catbox.moe/gdso67.png)

You can create infinite directories and subdirectories with your code files, however only files ending in "**.js**" in their name, and the "**code**" property in their structure will be properly executed.
### How to send additional parameters to my codes?
To send additional parameters to your code, you need to go back to your main file (usually the "**index.js**" file), and inside the **"on()"** event of loli.app call a callback and then the **"set()"** function that is inside that callback. All the parameters sent inside that function will be sent back to your code. For example:
```javascript
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
```javascript
module.exports = {
  data: {
    name: 'mention',
    description: 'Responds with a custom embed message when the bot is mentioned directly'.
  },
  code: (message, client, EmbedBuilder) => {
    const id = message.content.match(/^<@!?(\d+)>$/)?.[1];
    if (id !== client.user.id) return;

    const embed = new EmbedBuilder()
      .setTitle('Imagine a creative a title.')
      .setDescription('Now imagine a creative description.');
    
    return message.reply({
      content: 'And finally, imagine a creative content.',
      embeds: [embed]
    });
  }
};
```
For the example above, the result will be this:

![image](https://files.catbox.moe/pdlqt2.png)

## Advanced usage:
### Is it possible to execute codes in the main file?
Yes, there are three basic ways to do this with one variation each. To illustrate how the variations will work in each of the examples, we will only use the first way as an example. The first way is to send a function on the right side of the parameter where the code directory will be, that is, in the third parameter. Like this:
```javascript
app.on('messageCreate', './directory/', (code, message) => {
  if (message.content === '!ping') {
    return message.reply('Pong!');
  };
});
```
The variation of the previous code is the following code. This method will replace the execution of code in directories, however, we do not recommend this as it is redundant due to the fact that the same technique can be done directly in the "**on()**" event of the Discord.js client, completely eliminating the purpose of loli.app. Basically it consists of, in the same parameter where the directory would be, you send a function with the parameters to be executed:
```javascript
app.on('messageCreate', (code, message) => {
  if (message.content === '!ping') {
    return message.reply('Pong!');
  };
});
```
As previously stated, all of the following ways have variations equal to those already mentioned, so we will not give examples of them.
The second way to do it is to use the "**event()**" function present as a property of "**code**", and provide a function as a parameter of this function:
```javascript
app.on('messageCreate', './directory/', (code) => {
  code.event((message) => {
    if (message.content === '!ping') {
      return message.reply('Pong!');
    };
  });
});
```
The third and final way to do this is by using the return of the "**event()**" function, which will return an array object. In the following code, we store the return of this function in the constant "**message**":
```javascript
app.on('messageCreate', './directory/', (code) => {
  const message = code.event()[0];
  if (message.content === '!ping') {
    return message.reply('Pong!');
  };
});
```
### Is it possible to use the "once()" function?
Yes, this function is subject to all forms of use of the "**on()**" function, except that this function will only be executed once after the event is triggered. Furthermore, it is worth mentioning that the codes executed using this function are NOT stored in the cache, this is due to the nature of the "**once()**" function which is naturally executed only once, and therefore there is no need to store the codes related to it in the cache:
```javascript
app.once('messageCreate', 'directory');
```
### How can I access the codes that have been stored in the cache?
There are two ways to do this. The first way is by using the "**cache**" function present in the application:
```javascript
const Application = require('loli.app');
const app = new Application(client);

app.on('messageCreate', './directory/');
/* It is important to request the cache only after specifying your code folders,
so that they are correctly assigned to the cache at the time you request them. */

console.log(app.cache);
/* This code will provide you with all the codes of all the cached events.
You can use the "get()" function to specify the codes of which events you want, like this: */
console.log(app.cache.get('messageCreate'));
```
The second way to do this is to use the "**cache()**" function present directly as a property of "**code**" in the "**on()**" function, which will also return all the codes of all the events stored in the cache:
```javascript
app.on('messageCreate', './directory/', (code) => {
  console.log(code.cache());
/* Unlike the previous example, there is no use of the "get()" function directly.
You can specify the event directly in the cache function parameter. Like this: */
  console.log(code.cache('messageCreate'));
});
```
In addition to the previous examples, you may choose to only want the location of the codes. In this case, the "**paths**" property present in "**code**" of the "**on()**" function will return you an array with all the stored codes of the event that you specified in the second parameter of the "**on()**" function that were cached:
```javascript
app.on('messageCreate', './directory/', (code) => {
  console.log(code.paths);
});
```

> **Made with ❤️ by Makoto Colors!**