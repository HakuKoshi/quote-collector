

const Discord = require('discord.js');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.json"));
const mongoose = require('mongoose');

//=======================================================================================

mongoose.connect('mongodb://localhost/quote');
const Folder = require('./parts/Folder');
const getRandomColor = require('./parts/RandomColor');

//=======================================================================================

const bot = new Discord.Client();
bot.login(config.token);
bot.on("ready", () => console.log("Bot Started!"));


//=======================================================================================

bot.on("message", message => {
    if (message.content.startsWith(config.prefix)) {
        let mes = message.content.slice(config.prefix.length, message.content.length).split(" ");
        const command = mes[0];
        mes.shift();


        switch (command) {
            case 'help':
                message.channel.send("```pi!help: Xem list lệnh.\n\npi!addFolder: tạo Folder.\n\tVD: pi!addFolder Priest\n\npi!addQuote: Thêm quote vào Folder (nếu kèm link ảnh thì ghi link ảnh ở cuối).\n\tVD: pi!addQuote Priest [Một đoạn quote nào đó] [link ảnh].\n\npi!random: Xuất một quote bất kì trong folder\n\tVD: pi!random Priest  ```");
                break;
            case 'addFolder':
                // ================== Thêm một Folder ==================
                Folder.find(x => x != null)
                    .then(arr => {
                        console.log(mes[1]);
                        if (arr.find(x => x.name === mes[0])) message.channel.send(':negative_squared_cross_mark: Folder duplicated!');
                        else {
                            let quotes = [];
                            let images = [];
                            let credits = [];
                            let avatars = [];
                            Folder.insertMany([
                                {
                                    name: mes[0],
                                    quotes: quotes,
                                    images: images,
                                    credits: credits,
                                    avatars: avatars
                                }
                            ])
                            message.channel.send('Folder created!');

                        }

                    })
                    .catch(err => console.log(err.message));

                break;

            case 'addQuote':
                Folder.find(x => x != null)
                    .then(arr => {
                        const x = arr.find(x => x.name === mes[0]);
                        if (!x) message.channel.send(':negative_squared_cross_mark:  Folder not found!');
                        else {
                            mes.shift();
                            let text = mes.join(' ');
                            let img = "";
                            if (text.includes('http')) {
                                let locate = text.indexOf('http');
                                img = text.slice(locate, text.length);
                                text = text.slice(0, locate);

                            }
                            if (x.quotes.includes(text) && img == "") message.channel.send(':negative_squared_cross_mark:  Quote duplicated!!!');
                            else {
                                const credit = message.author.username;
                                const avatar = message.author.avatarURL
                                let newQuotes = x.quotes;
                                newQuotes.push(text);
                                let newImages = x.images;
                                newImages.push(img);
                                let newCredits = x.credits;
                                newCredits.push(credit);
                                let newAvatars = x.avatars;
                                newAvatars.push(avatar);

                                x.set({ quotes: newQuotes, images: newImages, credits: newCredits, avatars: newAvatars });
                                x.save();
                                message.channel.send(':white_check_mark: Quote Added!');
                            }
                        }
                    })
                    .catch(err => console.log(err.message));



                break;

            case 'random':
                Folder.find(x => x != null)
                    .then(arr => {
                        const x = arr.find(x => x.name === mes[0]);
                        if (!x) message.channel.send(':negative_squared_cross_mark:  Folder not found!');
                        else {
                            const rand = Math.floor(Math.random() * x.quotes.length);
                            const embed = new Discord.RichEmbed()
                                .setAuthor(x.name)
                                .setColor(getRandomColor())
                                .setDescription(x.quotes[rand])
                                .setImage(x.images[rand])
                                .setFooter(x.credits[rand], x.avatars[rand]);


                            message.channel.send(embed);
                            message.delete();
                        }
                    })
                break;
            case 'folder':
                if (mes[0] == undefined) {
                    Folder.find()
                        .then(arr => {
                            let str = "```ini\n[Các folder đã tạo:]\n";
                            arr.forEach(x => {
                                str += `${x.name} - ${x.quotes.length} quotes\n`;
                            })
                            str += "```";
                            console.log(str);
                            message.channel.send(str);
                        })
                }
                else {
                    Folder.find(x => x != null)
                        .then(arr => {
                            const x = arr.find(x => x.name == mes[0]);
                            if (!x) message.channel.send(':negative_squared_cross_mark: Folder not found!');
                            else {
                                if (mes[1]) {
                                    const pos = mes[1] - 1;
                                    if (pos > x.quotes.length || isNaN(pos)) message.channel.send(':negative_squared_cross_mark: Error!!!!')
                                    else {
                                        const embed = new Discord.RichEmbed()
                                            .setAuthor(x.name)
                                            .setColor(getRandomColor())
                                            .setDescription(x.quotes[pos])
                                            .setImage(x.images[pos])
                                            .setFooter(x.credits[pos], x.avatars[pos]);
                                        message.channel.send(embed);

                                    }


                                }
                                else {
                                    let str = "```markdown\n";
                                    str += `#${x.name}\n\n`;
                                    for (let i = 0; i < x.quotes.length; i++) {
                                        str += `${i + 1}. \n[${x.quotes[i].slice(0, 50)}...]\n\n`
                                    }
                                    str += '```';
                                    message.channel.send(str);
                                }

                            }
                        })

                }
                break;

                case 'inbox':
                message.author.send("Đã inbox");
                break;
        }
    }
})
