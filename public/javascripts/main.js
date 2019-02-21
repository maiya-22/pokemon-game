/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {


    // encapsulate code for refactoring:
    // previousCode();
    refactoredCode();

    function refactoredCode() {
        //refactor on a new branch
        // API REQUEST function returns a promise:

        const createPlayer = (name, characters = ['character-name one', 'character-name two', 'character-name three']) => {
            let Player = {
                name: name,
                characters: characters,
                charactersLoaded: false
            }

            // helper function will fetch each character from the Pokemon API, by the character's name:
            const fetchCharacterObject = (characterName) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', `https://pokeapi.co/api/v2/pokemon/${characterName}/`);
                    xhr.send();
                    xhr.onload = function () {
                        if (xhr.responseText === "Not Found" || xhr.status === 404) {
                            reject({ error: `character: '${characterName}' was not found in the API` })
                        }
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            // store successful fetch to localStorage before resolving:
                            localStorage.setItem(characterName, xhr.responseText);
                            resolve(JSON.parse(xhr.responseText));
                        }
                    };
                    xhr.onerror = function () {
                        reject({ errorInFetchCharacterPromise: xhr.statusText });
                    };
                });
            }
            // helper function takes the large ammount of data returned from the api and formats just the info that we need into a simple object:
            const reformatDataFromApi = (apiCharacterObject) => {
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
                return ({ name: characterName, stats: reformattedStats, abilities: reformattedAbilities, pic: defaultPic })
            }

            // the player will be returned as a promise:
            return new Promise((resolve, reject) => {
                let { characters } = Player;
                // go to the API and fetch all of the player's characters:
                Promise.all([fetchCharacterObject(characters[0])], [fetchCharacterObject(characters[1])], [fetchCharacterObject(characters[2])])
                    .then(arrayOfCharacters => {
                        let reformattedCharacters = arrayOfCharacters.map(apiCharacterObject => {
                            return reformatDataFromApi(apiCharacterObject)
                        });
                        // if everything was sucessfully fetched from api, resolve Player promise:
                        resolve({
                            name: Player.name,
                            characters: reformattedCharacters,
                            charactersLoaded: true
                        })

                    }).catch(err => {
                        console.log('error in create player promise-chain:', err);
                        // if there was an error fetching any of the characters from the API, reject Player promise:
                        reject(err);
                    })
            });
        }

        createPlayer("Chuck", ["dragonair", "butterfree", "charmeleon"]).then(player => {
            console.log("player:", player)
        }).catch(err => {
            console.log("err:", err)
        })



        // const fetchCharacterObject = (characterName) => {
        //     return new Promise((resolve, reject) => {
        //         const xhr = new XMLHttpRequest();
        //         xhr.open('GET', `https://pokeapi.co/api/v2/pokemon/${characterName}/`);
        //         xhr.send();
        //         xhr.onload = function () {
        //             if (xhr.responseText === "Not Found" || xhr.status === 404) {
        //                 reject({ error: `character: '${characterName}' was not found in the API` })
        //             }
        //             if (xhr.readyState === 4 && xhr.status === 200) {
        //                 // store successful fetch to localStorage before resolving:
        //                 localStorage.setItem(characterName, xhr.responseText);
        //                 resolve(JSON.parse(xhr.responseText));
        //             }
        //         };
        //         xhr.onerror = function () {
        //             reject({ errorInFetchCharacterPromise: xhr.statusText });
        //         };
        //     });
        // }

        // const reformatDataFromApi = (apiCharacterObject) => {
        //     return new Promise((resolve, reject) => {
        //         const characterName = apiCharacterObject.name;
        //         const reformattedStats = apiCharacterObject.stats.reduce((reformatted, stat) => {
        //             reformatted[stat.stat.name] = stat.base_stat;
        //             return reformatted;
        //         }, {});
        //         const reformattedAbilities = apiCharacterObject.abilities.reduce((arr, ability, index) => {
        //             arr[index] = ability.ability.name;
        //             return arr;
        //         }, []);
        //         const defaultPic = apiCharacterObject.sprites.front_default;
        //         resolve({ name: characterName, stats: reformattedStats, abilities: reformattedAbilities, pic: defaultPic })
        //     });
        // }



        // // promise chain to fetch and reformat data:
        // fetchCharacterObject("dragonair").then(character => {
        //     console.log("dragonair", character);
        //     return character;
        // }).catch(err => {
        //     console.log('error in fetch Character promise chain:', err);
        // }).then(character => {
        //     return reformatDataFromApi(character)
        // }).then(data => {
        //     console.log("reformatted data:", data)
        // }).catch(err => {
        //     console.log('error in promise chain')
        // });






        // next line is end of refactored code:
    }

    // store our data to the localStorage object, in case of errors later
    // if the call was successful, store the character to localStorage in case api goes down/ too many requests


    // before setting to localStorage, making sure was a successful response. Not sure if need to do this:
    function previousCode() {
        // The Character class has methods that go to the Pokemon api and fetch a Pokemon character JSON, and then reformat
        // the JSON into an object that we can then use in our JS.
        class Character {
            constructor(characterName, pic, stats, abilities) {
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
                            // console.log('successful fetch to api');
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

        // console.log("Chuck:", chuck)
        // console.log("Professor Doom:", chuck)

        // load each character's gym. Don't remember why I chained it, instead of Promise.all
        chuck
            .loadGymPromise() // loading Chuck's gym
            .then(gym =>
                // console.log('chucks gym:', gym);
                professorDoom.loadGymPromise())
            .then((gym) => {
                // #NOTE:  right here, is where we need to make visual cues, that make the page active, because the Pokemon have all arrived and are in their trainers' gyms.
                // console.log("gyms are loaded:", chuck, professorDoom);
            })
            .catch((err) => {
                console.log(`error caught in loadGymPromise chain: ${err}`);
            });


        // working:
        const spinningButtons = document.getElementsByClassName('spinningButton');

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





        function renderCharacterToFloatingDisplay(characterObject, playerName) {

            // console.log("player name:", playerName)
            // selet the container elments froom the DOM:
            let statsWrap;
            let typeWrap; //will wrap the type animation

            if (playerName === 'professor') {
                statsWrap = document.getElementById('professorStats');
                typeWrap = document.getElementById('professorNames');
            } else if (playerName === 'chuck') {
                statsWrap = document.getElementById('chuckStats');
                typeWrap = document.getElementById('chuckNames');
            }



            // remove any displayed stats and display current stats
            const characterName = characterObject.name;
            removeStats();
            removeType();
            renderType(characterName);
            renderStats(characterObject, playerName);


            function removeStats() {
                statsWrap.innerHTML = '';

            }

            function removeType() {
                typeWrap.classList.remove('textAnimation');
                typeWrap.innerHTML = '';
                // console.log('typeWrap after remove textAnimation: ', typeWrap);
            }
            function renderType(characterName) {

                typeWrap.innerHTML = characterName;
                // animation not working:


                typeWrap.classList.add('textAnimation');



            }

            let grimScoreBox = document.getElementById("professorScore")
            let chuckScoreBox = document.getElementById("chuckScore")
            let grimScore = 0;
            let chuckScore = 0;
            function renderStats() {

                const { stats } = characterObject;
                // console.log("characterObject:", characterObject);
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
                        // console.log("playerNAME", playerName)

                        setTimeout(() => {
                            const statBox = document.createElement('div');
                            statBox.classList.add('statBox');
                            statBarWrap.appendChild(statBox);
                            // if the current box-number is at the actual stat value, then add the statNumber here:
                            if (i === stats[stat] - 1) {
                                if (playerName === 'professor') {
                                    grimScore += stats[stat]
                                    grimScoreBox.innerHTML = grimScore;
                                } else if (playerName === 'chuck') {
                                    chuckScore += stats[stat]
                                    chuckScoreBox.innerHTML = chuckScore;
                                }
                                setTimeout(() => {
                                    const statNumberBox = document.createElement('div');
                                    statNumberBox.classList.add('statNumberBox');
                                    statNumberBox.innerHTML = stats[stat];
                                    statBarWrap.appendChild(statNumberBox);

                                }, 20);
                                // and update the score box:


                            }
                        }, i * 20);
                        statWrap.appendChild(statBarWrap);
                    }
                    // end of for loop:
                    statsWrap.appendChild(statWrap);
                }); // end of forEach loop
            }
        }

        // do something to only make the button click-able after the pokemon have been fetched.
        // for now, just using setTimeout
        // play a random game:
        // choose a random character from each trainer
        // trigger the click event on that character
        // tally their score
        // display the score and say who wins:
        // attatch this function to the play button
        function playRandomGame(player, playerOne, playerTwo) {
            // console.log("player", e.target.dataset.player)
            // // data-player="chuck"
            // // data-player="professor"
            // using global characters for now. Need to refactor:
            playerOne = chuck;
            playerTwo = professorDoom;

            const scoreBoxOne = document.getElementById('chuckScore');
            const scoreBoxTwo = document.getElementById('professorScore');
            const scoreBox = document.getElementById(`${player}Score`);


            // for animating name appearance:
            let chucksNames = document.getElementById('chuckNames')
            let professorNames = document.getElementById('professorNames')
            if (player === 'chuck') {
                chucksNames.className = ""
            } else {
                professorNames.className = ""
            }


            scoreBox.innerHTML = "0"


            // scoreBoxOne.innerHTML = "0";
            // scoreBoxTwo.innerHTML = "0"


            const selectRandomCharacter = (playerObj) => {
                return playerObj.characters[Math.floor(Math.random() * playerObj.characters.length)]
            }

            let character;
            if (player === "chuck") {
                character = selectRandomCharacter(chuck);
            } else {
                character = selectRandomCharacter(professorDoom);
            }


            let characterOne = selectRandomCharacter(playerOne);
            let characterTwo = selectRandomCharacter(playerTwo);


            let characterButton = document.querySelector(`[data=${character}]`)
            let characterOneButton = document.querySelector(`[data=${characterOne}]`);
            let characterTwoButton = document.querySelector(`[data=${characterTwo}]`);

            characterButton.click();
            // characterOneButton.click()
            // characterTwoButton.click()

            // put these on the class?
            let characterScore;

            if (character === "chuck") {
                characterScore = chuck.gym[characterOne].stats.reduce((total, stat) => {
                    return total + stat.base_stat;
                }, 0);
            } else {
                characterScore = professor.gym[characterOne].stats.reduce((total, stat) => {
                    return total + stat.base_stat;
                }, 0);
            }
            // let characterTwoScore = playerTwo.gym[characterTwo].stats.reduce((total, stat) => {
            //     return total + stat.base_stat;
            // }, 0);

            function animateScore(id, start, end, duration) {
                var range = end - start;
                var current = start;
                var increment = end > start ? 1 : -1;
                var stepTime = Math.abs(Math.floor(duration / range));
                var obj = document.getElementById(id);
                var timer = setInterval(function () {
                    current += increment;
                    obj.innerHTML = current;
                    if (current == end) {
                        clearInterval(timer);
                    }
                }, stepTime);
            }

        }

        let playGameButtons = document.getElementsByClassName('play-game-button');
        for (let i = 0; i < playGameButtons.length; i++) {
            playGameButtons[i].addEventListener('click', function (e) {
                let { player } = e.target.dataset
                playRandomGame(player);
            });
        }

    }

};