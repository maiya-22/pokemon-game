/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {
    console.log("js loaded");

    function containPreviousCode() {
        console.log('INSTRUCTIOS:  This game is in progress.  To see animations, please click on the spinning icons on both sides of the screen.');
        // CHARACTER CLASS, USED FOR OUR POKEMON
        class Character {
            constructor(characterName, pic, gif, stats, abilities) {
                this.name = characterName;
                this.pic = pic;
                this.gif = gif;
                this.stats = stats;
                this.abilities = abilities;
            }
            // function goes to the api and gets a promise for pokemon object
            getCharacterPromise(characterName) {
                const endpoint = characterName || this.name;
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', `${this.apiURL}/${endpoint}/`);
                    xhr.send();
                    xhr.onload = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            // store our data to the localStorage object, in case of errors later
                            console.log('successful fetch to api');
                            localStorage.setItem(characterName, xhr.responseText);
                        }
                        resolve(JSON.parse(xhr.responseText));
                    };
                    xhr.onerror = function () {
                        // instead of rejecting the error, we are resolving the data on the local storage.
                        console.log('local storage in the error event: ', localStorage);
                        resolve(JSON.parse(localStorage[characterName]));
                        // reject(xhr.statusText);
                    };
                });
            }
            makeCharacterInstance(characterObject) {
                // take all of the data in the object that the a.p.i. returns
                // and extract it in a way that allows us to neatly pass it to our Character constructor function:
                const characterName = characterObject.name;
                const reformattedStats = characterObject.stats.reduce((reformatted, stat) => {
                    reformatted[stat.stat.name] = stat.base_stat;
                    return reformatted;
                }, {});
                const reformattedAbilities = characterObject.abilities.reduce((arr, ability, index) => {
                    arr[index] = ability.ability.name;
                    return arr;
                }, []);
                const defaultPic = characterObject.sprites.front_default;
                // if our hash of gifs, contains a gif for this character, add it;  if not, store it as a 'null' value
                const gif = Character.prototype.gifs[characterName] || null;
                // create an instance of a Character constructor function/ class, and return it.
                return new Character(characterName, defaultPic, gif, reformattedStats, reformattedAbilities);
            }
        }
        Character.prototype.apiURL = 'https://pokeapi.co/api/v2/pokemon';
        // since we are adding external gifs, we will store whichever gifs we are able to find here:
        // #NOTE: paste the gif you want to use for your characters here:
        Character.prototype.gifs = {
            weezing: 'add gif',
            oddish: 'add gif',
            gloom: 'add gif',
            dragonair: 'http://www.pokestadium.com/sprites/xy/dragonair-2.gif',
            butterfree:
                'http://rs744.pbsrc.com/albums/xx87/jessstaardust/tumblr_n1234ahMHc1s2qnyjo1_250_zpsa8f9c122.gif~c200',
            charmeleon:
                'https://orig00.deviantart.net/5293/f/2016/030/b/7/charmeleon_gif_by_queenaries-d9px7h5.gif',
        };
        // PLAYER CLASS USED FOR OUR TRAINERS
        class Player {
            constructor(playerName, charactersArray) {
                this.name = playerName;
                this.gym = {};
                this.characters = charactersArray;
            }
            // made load gym a promise too, so that we can do things after the gyms are loaded:
            loadGymPromise(arrayOfCharacters) {
                const charactersArray = this.characters || arrayOfCharacters;
                return new Promise((resolve, reject) => {
                    const arrayOfPromises = [];
                    for (let i = 0; i < charactersArray.length; i++) {
                        const characterName = charactersArray[i];
                        const promise = Character.prototype.getCharacterPromise(characterName);
                        arrayOfPromises[i] = promise;
                    }
                    Promise.all(arrayOfPromises)
                        .then((arrayOfCharacterObjects) => {
                            arrayOfCharacterObjects.forEach((characterObject) => {
                                this.gym[characterObject.name] = characterObject;
                            });
                            resolve(this.gym);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            }
        }

        // here we create our player instances, and pass an array of our pokemon names:
        const professorDoom = new Player('Professor Doom', ['weezing', 'oddish', 'gloom']);
        const chuck = new Player('Chuck', ['dragonair', 'butterfree', 'charmeleon']);
        // call the .loadGymPromise() function on our characters.  This dynamically fetches all their characters from the api
        // promise chain to load both player's gym:
        chuck
            .loadGymPromise() // loading Chuck's gym
            .then(gym =>
                // console.log('chucks gym:', gym);
                professorDoom.loadGymPromise())
            .then((gym) => {
                // #NOTE:  right here, is where we need to make visual cues, that make the page active, because the Pokemon have all arrived and are in their trainers' gyms.
            })
            .catch((err) => {
                console.log(`error caught in loadGymPromise chain: ${err}`);
            });

        // After all of the above code has run, the page should now appear active.
        // CODE FOR THEN MANIPULATING AND RENDERING TO THE DOM:
        // select the spinning icons and add an 'click' event-listener to them:
        const spinningButtons = document.getElementsByClassName('spinningButton');
        for (let i = 0; i < spinningButtons.length; i++) {
            const button = spinningButtons[i];
            button.addEventListener('click', () => {
                // get the character name off of the button that was clicked:
                const characterName = button.getAttribute('data');
                // get the character object from local storage, if it exists:
                let characterObject = JSON.parse(localStorage[characterName]);
                // console.log('characterObject in event listener: ', characterObject);
                let playerName;
                // see which trainer owns this character:
                if (chuck.characters.includes(characterName)) {
                    // console.log('this character belongs to CHUCK');
                    playerName = 'chuck';
                    // if the characterObject was not found in local storage, get it from the trainer's gym:
                    characterObject = characterObject || chuck.gym[characterName];
                } else if (professorDoom.characters.includes(characterName)) {
                    // console.log('this character belongs to the professor');
                    playerName = 'professor';
                    // if the characterObject was not found in local storage, get it from the trainer's gym:
                    characterObject = characterObject || professorDoom.gym[characterName];
                }
                // format the character by creating an instance of Character:
                const formattedCharacterObject = Character.prototype.makeCharacterInstance(characterObject);
                renderCharacterToFloatingDisplay(formattedCharacterObject, playerName);
                // THIS is where we randomly select one of the other Trainer's pokemon, to display it, as well.
            });
        }

        function renderCharacterToFloatingDisplay(characterObject, playerName) {
            // selet the container elments froom the DOM:
            let statsWrap;
            let typeWrap;
            if (playerName === 'professor') {
                statsWrap = document.getElementById('professorStats');
                typeWrap = document.getElementById('professorNames');
            } else if (playerName === 'chuck') {
                statsWrap = document.getElementById('chuckStats');
                typeWrap = document.getElementById('chuckNames');
            }

            //  randomly display a score to the score boards
            setTimeout(() => {
                const scoreBoxOne = document.getElementById('chuckScore');
                const scoreBoxTwo = document.getElementById('professorScore');
                const scoreOne = Math.floor(Math.random() * 100);
                const scoreTwo = Math.floor(Math.random() * 100);
                scoreBoxOne.innerHTML = scoreOne;
                scoreBoxTwo.innerHTML = scoreTwo;
            }, 500);

            // remove any displayed stats and display current stats
            const characterName = characterObject.name;
            removeStats();
            removeType();
            renderType(characterName);
            renderStats(characterObject, playerName);

            function removeStats() {
                statsWrap.innerHTML = '';
                statsWrap.classList.remove('textAnimation');
            }

            function removeType() {
                // typeWrap.classList.remove('textAnimation');
                typeWrap.innerHTML = '';
                console.log('typeWrap after remove textAnimation: ', typeWrap);
            }
            function renderType(characterName) {
                typeWrap.innerHTML = characterName;
                typeWrap.classList.add('textAnimation');
                console.log('function addType: characterName: ', characterName);
                console.log('function addType: typeWrap: ', typeWrap);
            }

            function renderStats() {
                const { stats } = characterObject;
                const statNames = Object.keys(stats);
                statNames.forEach((stat) => {
                    // make a statWrap for each stat and add everything to it:
                    const statWrap = document.createElement('div');
                    statWrap.classList.add('statWrap');
                    statWrap.setAttribute('id', 'statTitle');
                    const statLabel = document.createElement('div');
                    statLabel.setAttribute('id', 'statLabel');
                    statLabel.innerHTML = `${stat}:  `;
                    statWrap.appendChild(statLabel);
                    const statBarWrap = document.createElement('div');
                    statBarWrap.classList.add('statBarWrap');
                    // add boxes inside of the statBarWrap:
                    for (let i = 0; i < stats[stat]; i++) {
                        setTimeout(() => {
                            const statBox = document.createElement('div');
                            statBox.classList.add('statBox');
                            statBarWrap.appendChild(statBox);
                            // if the current box-number is at the actual stat value, then add the statNumber here:
                            if (i === stats[stat] - 1) {
                                setTimeout(() => {
                                    const statNumberBox = document.createElement('div');
                                    statNumberBox.classList.add('statNumberBox');
                                    statNumberBox.innerHTML = stats[stat];
                                    statBarWrap.appendChild(statNumberBox);
                                }, 20);
                            }
                        }, i * 20);
                        statWrap.appendChild(statBarWrap);
                    }
                    // end of for loop:
                    statsWrap.appendChild(statWrap);
                }); // end of forEach loop
            }
        }
    }
};