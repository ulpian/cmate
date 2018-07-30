![club-mate logo](https://www.clubmate.jp/resources/img/logotext-header.png)

# CMate
**Compiled-Mate Pronounced (MAH-tay) like the drink Club-Mate**
A tiny compiler for Javascript transformation code powered by webpack.

[![Node](https://img.shields.io/badge/Node-v8.0+-blue.svg)]()
[![NPM](https://img.shields.io/badge/NPM-v6.0+-blue.svg)]()

- Use separate files and dependencies!
- Modules that can be used across alignments!
- Compiles to human-readable code
- You can still edit code on the Leverton platform
- No duplication of code or dependencies (not matter how deep)
- Automatically updates online behind-the-scenes (*only upon saving your file*)
- Ability to execute offline - output to `./dist/bundle.js`
- Works with any IDE software
- Easily apply any linting
- Works together with any webpack plugin or loader
- Can be reverse-compiled
- Watches for code changes
- See Javascript errors before posting to the platform

### Getting started
To get started simply download this repository as a `.zip` / `.tar` or alternatively you can clone through git.

Once downloaded you will need to install dependencies through `npm` (Please check that you have the node and npm versions defined in the badges of this README);

`npm install`

You are now ready to go!

All your files must be created within the `./src` directory. You can name your files either with just the alignment number or anything you like but you must declare the alignment id you are working on with `--align`.

It is recommended that any code that is a module, re-usable function, library etc should be added to the `./modules` folder but this is optional.

If you are ready to start just run;

`npm run start -- --align ALIGNMENT_ID`

of if you named your file something custom then simply run;

`npm run start -- --file FILENAME`

Example with code for alignment 342;

`npm start -- --align 342 --online`


*You can view your file size upon every build when you save your files;*

```bash
Built at: 2018-07-30 13:11:03
    Asset      Size  Chunks             Chunk Names
bundle.js  62.9 KiB    main  [emitted]  main
```

### Watching
This compiler is powered through webpack and it's default state is to watch, through this you can also see the size of your

Once the code is compiled the output injection meta data such as;

```Javascript
// Source: ./src/modules/add.js
// Dependency parent: ./src/319.js
```

### Online
You can easily connect with the Leverton platform by using your Leverton platform credentials. Just open up the `.env` file and fill in your **username** and **password**.

### Gotcha's
There a few things to watch out for when using this compiler;

- Make sure to write es5!
- Globally declared variables may conflict if they are called the same
- `require`'ing node or javascript modules cause unforeseen conflicts.

### Potential new features
- Tests run through Nashorn javascript engine locally to catch any errors
- Documentation generator (i.e [https://github.com/documentationjs/documentation](https://github.com/documentationjs/documentation))
