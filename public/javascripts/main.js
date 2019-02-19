/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {
    console.log("js loaded");

    // The Character class has methods that go to the Pokemon api and fetch a Pokemon character JSON, and then reformat
    // the JSON into an object that we can then use in our JS.
    class Character {
        constructor(characterName, pic, gif, stats, abilities) {
            this.name = characterName;
            this.pic = pic;
            this.stats = stats;
            this.abilities = abilities;
        }
        // function returns a promise function. Inside the promise function, there is an xhr request sent to the Pokemon api.  
        getCharacterPromise(characterName) {
            const endpoint = characterName || this.name;
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', `https://pokeapi.co/api/v2/pokemon/${endpoint}/`);
                xhr.send();
                xhr.onload = function () {
                    // before setting to localStorage, just making sure was a successful response. Not sure if need to do this:
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        // store our data to the localStorage object, in case of errors later
                        console.log('successful fetch to api');
                        // if the call was successful, store the character to localStorage in case api goes down/ too many requests
                        localStorage.setItem(characterName, xhr.responseText);
                    }
                    resolve(JSON.parse(xhr.responseText));
                };
                xhr.onerror = function () {
                    // if you get an error, first check to see if character is in localStorage and try to resolve with that data before sending error.
                    if (localStorage[characterName]) {
                        resolve(JSON.parse(localStorage[characterName]));
                    } else {
                        reject(xhr.statusText);
                    }
                };
            });
        }
        // This function takes the messy JSON objects that we get from the api and formats them the way we want them
        // And passes the data to the constructor function, which finally creates the character object that we will use.
        makeCharacterInstance(apiCharacterObject) {
            const characterName = apiCharacterObject.name;
            const reformattedStats = apiCharacterObject.stats.reduce((reformatted, stat) => {
                reformatted[stat.stat.name] = stat.base_stat;
                return reformatted;
            }, {});
            const reformattedAbilities = apiCharacterObject.abilities.reduce((arr, ability, index) => {
                arr[index] = ability.ability.name;
                return arr;
            }, []);
            const defaultPic = apiCharacterObject.sprites.front_default;
            // pass all the reformated data to the constructor function
            return new Character(characterName, defaultPic, reformattedStats, reformattedAbilities);
        }
    }

    // The Player Class 
    // The players will have characters stored in their "gym" - so the Player class has methods that fetch the characters.
    class Player {
        constructor(playerName, charactersArray) {
            this.name = playerName;
            // When you make a player instance, you enter an array of pokemon names:
            this.characters = charactersArray;
            // then, you call player.loadGymPromise()
            // that will use the Character class' methods to fetch the characters, format the characters.
            // and will then store them to this object: {characterName: {characterName: "name", "abilities": [], stats: []}} 
            this.gym = {};
        }
        // made load gym a promise too, so that we can do things after the gyms are loaded:
        loadGymPromise() {
            const charactersArray = this.characters;
            return new Promise((resolve, reject) => {
                const arrayOfPromises = [];
                for (let i = 0; i < charactersArray.length; i++) {
                    const characterName = charactersArray[i];
                    // use the Character class to fetch the data, reformat it, and return it as a promise:
                    const promise = Character.prototype.getCharacterPromise(characterName);
                    arrayOfPromises[i] = promise;
                }
                // makes sure all of the promises are resolved before storing them to the gym object:
                Promise.all(arrayOfPromises)
                    .then((arrayOfCharacterObjects) => {
                        // store teh instances in 
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

    // Create the two players, Chuck and Professor Doom. 
    // Args = player's name, array of Pokemon characters' names:
    const chuck = new Player('Chuck', ['dragonair', 'butterfree', 'charmeleon']);
    const professorDoom = new Player('Professor Doom', ['weezing', 'oddish', 'gloom']);
    console.log("Chuck:", chuck)
    console.log("Professor Doom:", chuck)

    // load each character's gym. Don't remember why I chained it, instead of Promise.all
    chuck
        .loadGymPromise() // loading Chuck's gym
        .then(gym =>
            // console.log('chucks gym:', gym);
            professorDoom.loadGymPromise())
        .then((gym) => {
            // #NOTE:  right here, is where we need to make visual cues, that make the page active, because the Pokemon have all arrived and are in their trainers' gyms.
            console.log("gyms are loaded:", chuck, professorDoom);
        })
        .catch((err) => {
            console.log(`error caught in loadGymPromise chain: ${err}`);
        });


    const spinningButtons = document.getElementsByClassName('spinningButton');
    console.log("SPINNING BUTTON:", spinningButtons)
    for (let i = 0; i < spinningButtons.length; i++) {
        const button = spinningButtons[i];
        button.addEventListener('click', () => {
            // get the character name off of the button that was clicked:
            const characterName = button.getAttribute('data');
            // get the character object from local storage, if it exists:
            let characterObject = JSON.parse(localStorage[characterName]);
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





    // here we create our player instances, and pass an array of our pokemon names:



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

};