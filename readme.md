# loli.app
***A simple and quick way to filter and run your codes!***
```
npm i loli.app
```

### Overview
**loli.app** is a powerful and easy-to-use module designed to help developers manage and execute their code based on **[discord.js](https://github.com/discordjs/discord.js)** events. It offers a structured approach to organizing your code into directories and provides seamless execution based on specific event triggers. By passing a `discord.js` client or a compatible client as a parameter, you can quickly get started with filtering and running your code in a clean and maintainable way.

> [!NOTE]
> Although **loli.app** is optimized for use with the `discord.js` client, it is designed with flexibility in mind. You can use it with other clients like **[Eris](https://github.com/abalabahaha/eris)** or **[guilded.js](https://github.com/zaida04/guilded.js)**. However, please note that while these alternatives are supported, their compatibility is not guaranteed. Use them at your own risk.

> [!TIP]
> If you run into any issues or have questions, don’t hesitate to join our **[support server](https://discord.gg/sEXMV36WDW)** on **Discord**. Our community and developers are there to assist you.

## Getting Started
### Setting Up the discord.js Client
To effectively use **loli.app**, you need to provide a `discord.js` client (or a compatible alternative) as a parameter. This client serves as the backbone for executing your code based on various Discord events. Here’s a quick guide on how to initialize and configure the `discord.js` client:

```javascript
const { Client } = require('discord.js');
const client = new Client({
  // Define your client options here, such as intents and presence settings.
}); // This client instance will be used throughout this guide.
client.login('YOUR_BOT_TOKEN'); // Replace 'YOUR_BOT_TOKEN' with your actual bot token.
```

### Initializing the loli.app Module
Once your `discord.js` client is ready and running, you can integrate it with **loli.app**. By passing the client instance to **loli.app**, you set the stage for managing your event-based code. Below is an example of how to initialize **loli.app** and define directories where your event-specific code is stored:

```javascript
const Application = require('loli.app');
const app = new Application(client); // This app instance will manage your event-driven code execution.
```

## Basic Usage
### Running Event-Driven Code with the `run()` Function
The `run()` function is the heart of **loli.app**. It allows you to link specific Discord events with directories containing the corresponding code. This modular approach makes it easy to manage and scale your bot’s functionality:

```javascript
// Define the event and the directory where related code files are stored.
app.run('messageCreate', './events/messageCreate/');

// You can define different directories for various events, providing a clean and organized structure.
app.run('ready', './events/ready/');
app.run('error', './events/error/');
```

### Structuring Your Code Files
In each specified directory, you can place your JavaScript files. **loli.app** will automatically execute files that meet the following criteria:
- The file must have a `.js` extension.
- The file must export an object containing a `code` property, which holds the function to be executed.

Any files that do not meet these requirements will be ignored, ensuring that only relevant code is run:

<sub>`./events/messageCreate/ping.js`</sub>

```javascript
module.exports = {
  data: { // The data object is optional and used for better organization.
    name: 'ping',
    description: 'Replies with "Pong!" when the "!ping" command is detected.'
  },
  code: (message) => {
    if (message.content === '!ping') {
      return message.reply('Pong!');
    }
  }
};
```

For simplicity, you can streamline the code as shown below, although this is not recommended as it may reduce clarity:

```javascript
module.exports = code = (message) => {
  if (message.content === '!ping') {
    return message.reply('Pong!');
  }
};
```

Feel free to create as many directories and subdirectories as necessary. The module will only execute `.js` files that contain a `code` property, allowing you to maintain a well-organized and efficient codebase.

### Passing Additional Parameters to Your Code
There are situations where your code may need additional data or utilities beyond what is provided by the Discord event. **loli.app** allows you to pass additional parameters to your code by modifying your main file. Here’s how you can do this:

```javascript
const { Client, EmbedBuilder } = require('discord.js');
const client = new Client({
  // Define your client options here.
});
client.login('YOUR_BOT_TOKEN'); // Replace 'YOUR_BOT_TOKEN' with your actual bot token.

const Application = require('loli.app');
const app = new Application(client);

app.run('messageCreate', './events/messageCreate/', (code) => {
  // Use the set() function to pass additional parameters to your code.
  code.set(client, EmbedBuilder);
  // You can pass as many parameters as needed.
});
```

In your code files, you can then access these additional parameters to enhance functionality:

```javascript
module.exports = {
  data: {
    name: 'mention',
    description: 'Replies with a custom embed message when the bot is mentioned directly.'
  },
  code: (message, client, EmbedBuilder) => {
    const id = message.content.match(/^<@!?(\d+)>$/)?.[1];
    if (id !== client.user.id) return;

    const embed = new EmbedBuilder()
      .setTitle('Creative Title')
      .setDescription('Creative Description');
    
    return message.reply({
      content: 'Creative Content',
      embeds: [embed]
    });
  }
};
```

### Defining Single-Run Code with the `once` Property
In some cases, you might want a piece of code to execute only once when an event occurs. To handle this, you can specify the `once` property within your module export. This property ensures that the code is run only a single time:

```javascript
module.exports = {
  data: {
    once: true
  },
  code: () => {
    // Your single-run code here.
  }
};
```

Alternatively, you can define `once` directly outside of the `data` object:

```javascript
module.exports = {
  once: true,
  code: () => {
    // Your single-run code here.
  }
};
```

## Advanced Usage
### Directly Executing Code in the Main File
For more advanced use cases, **loli.app** provides flexibility in how you handle code execution. You can directly execute code in your main file using several approaches:

1. **Using a Callback Function:**
   You can pass a function as the third parameter to the `run()` method. This function will be executed at the same time that the code in a directory is loaded for execution:

   ```javascript
   app.run('messageCreate', './events/messageCreate/', (code, message) => {
     if (message.content === '!ping') {
       return message.reply('Pong!');
     }
   });
   ```

2. **Direct Function Execution:**
   In cases where you do not need to load code from a directory, you can directly pass a function to `run()`:

   ```javascript
   app.run('messageCreate', (code, message) => {
     if (message.content === '!ping') {
       return message.reply('Pong!');
     }
   });
   ```

3. **Using the `event()` Method:**
   You can also use the `event()` method within `code` to execute code based on specific events:

   ```javascript
   app.run('messageCreate', './events/messageCreate/', (code) => {
     code.event((message) => {
       if (message.content === '!ping') {
         return message.reply('Pong!');
       }
     });
   });
   ```

4. **Capturing Event Data:**
   The `event()` method can return an array containing event data, allowing for more granular control:

   ```javascript
   app.run('messageCreate', './events/messageCreate/', (code) => {
     const message = code.event()[0];
     if (message.content === '!ping') {
       return message.reply('Pong!');
     }
   });
   ```

### Using the `on()` and `once()` Methods
The `on()` and `once()` methods provide a more intuitive way to handle event-driven code. The `on()` method handles code that should run multiple times, while `once()` ensures code runs only once:

```javascript
app.once('ready', () => console.log('Bot is ready!'));
app.on('messageCreate', './events/messageCreate/');
```

### Accessing and Managing the Cache
**loli.app** offers a caching mechanism to store and retrieve code information, which can be useful for optimizing performance and managing code execution. You can access the cache in two primary ways:

1. **Using the `cache` Property of the `app` Instance:**

   Before accessing the cache, ensure that the directories are properly initialized:

   ```javascript
   app.run('messageCreate', './events/messageCreate/');

   // Retrieve the entire cache.
   console.log(app.cache);

   // Navigate through the cache to retrieve specific event data.
   console.log(app.cache.get('once').get('messageCreate'));
   ```

2. **Using the `cache` Property from the `code` Object:**

   Access the cache directly from within the `run()` method:

   ```javascript
   app.run('ready', (code) => {
     console.log(code.cache);

     // Retrieve specific event data from the cache.
     console.log(code.cache.get('on').get('messageCreate'));
   });
   ```

---

> **Crafted with ❤️ by Makoto Colors!**