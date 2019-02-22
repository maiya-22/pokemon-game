/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {

    // function creates a player by defining the player name, and fetching all of their pokemon data from the api
    // returns a promise for the player
    const createPlayer = (name, characterNames = ['character-name one', 'character-name two', 'character-name three']) => {
        let playerNumbers = "playerOne playerTwo".split(' ')
        let Player = {
            name: name,
            score: 0,
            characters: {},
            charactersLoaded: false,
        }
        // helper function will fetch each character from the Pokemon API, by the character's name:
        // returns a promise for the pokemon character:
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
                        // previously, was storing successful fetch to localStorage before resolving
                        // localStorage.setItem(characterName, xhr.responseText);
                        resolve(JSON.parse(xhr.responseText));
                    }
                };
                xhr.onerror = function () {
                    reject({ errorInFetchCharacterPromise: xhr.statusText });
                };
            });
        }
        // helper function takes the data returned from the api and reformats just the info that we need into a simple object:
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

        // the Player will be returned as a promise:
        return new Promise((resolve, reject) => {
            fetchCharacterObject(characterNames[0])
                .then(characterObj => {
                    Player.characters.characterOne = reformatDataFromApi(characterObj);
                    return fetchCharacterObject(characterNames[1]);
                })
                .then(characterObj => {
                    Player.characters.characterTwo = reformatDataFromApi(characterObj);
                    return fetchCharacterObject(
                        characterNames[2]);
                }).then(characterObj => {
                    Player.characters.characterThree = reformatDataFromApi(characterObj);
                    // once all of the Pokemon characters have been fetched,
                    // resolve the promise that called this promise chain:
                    resolve(Player);
                }).catch(err => {
                    // if there is an error, load backup data
                    reject(err);
                })
            // .finally(() => {
            // Safari not recognizing finally().
            // console.log("fetch character promise has run");
            // });
        });
    }
    // end of createPlayer function

    // CREATING THE GAME:
    // let playButtons = document.getElementsByClassName('play-button');
    let playerOneName = "professor grim";
    let playerOneCharacters = ["oddish", "gloom", "weezing"];
    let playerTwoName = "chuck";
    let playerTwoCharacters = ["dragonair", "butterfree", "charmeleon"];
    let playButtons = document.getElementsByClassName('play-button');
    const game = {
        playerOne: null,
        playerTwo: null,
        winner: null
    };

    // Call the promises that create the players
    // Should mabye be reformatted to Promise.all, so that both 
    // characters are created at the same time.
    createPlayer(playerOneName, playerOneCharacters)
        .then(playerObject => {
            // when the player arrives, store it to the global game variable
            game.playerOne = {};
            game.playerOne = playerObject;
            return createPlayer(playerTwoName, playerTwoCharacters)
        }).then(playerObject => {
            // when the player arrives, store it to the global game variable
            game.playerTwo = {};
            game.playerTwo = playerObject;
        }).catch(err => {
            console.log("error in create players chain:", err)
        });

    // NOW ANIMATE THE GAME:
    // click listener: if you click a character button, the event-listener will fire the playMove function to animate the player's turn:
    let gameElement = document.getElementById("game-frame");
    gameElement.addEventListener("click", (e) => {
        let playerName = e.target.dataset.player;
        let characterName = e.target.dataset.character;
        if (playerName && characterName) {
            playMove(playerName, characterName)
        }
    });

    function playMove(playerName, characterName) {
        // get objects from the game object:
        let player = game[playerName];
        let { score } = player;
        let character = player.characters[characterName];
        // console.log("game:", game)
        let { stats } = character;

        // get the player's DOM elements:
        let scoreBox = document.getElementById(`${playerName}-score-box`);
        let statBox = document.getElementById(`${playerName}-stat-box`);
        let nameBox = document.getElementById(`${playerName}-name-box`);
        let instructions = document.getElementById(`${playerName}-instructions`);

        // clear the nameBox of instructions or previous played character's name & remove previous stats drawing:
        nameBox.innerHTML = "";
        statBox.innerHTML = "";
        let characterNameDisplay = document.createElement('div');
        characterNameDisplay.classList = "current-character-name";
        characterNameDisplay.innerHTML = character.name[0].toUpperCase() + character.name.slice(1);

        // put the character's name in the box
        setTimeout(() => {
            nameBox.appendChild(characterNameDisplay);
        }, 10);

        // DRAW the stats animation:
        // Add the HTML/DOM elements that will be labels for the stats and contain a bar that measures the stat:
        let statNames = Object.keys(stats);
        statNames.forEach(stat => {
            // in the stat box, create dom elements to hold the labels for each stat
            // and create a frame for a red bar to be drawn to measure the stat
            let statValue = stats[stat]
            const statWrap = document.createElement('div');
            statWrap.classList.add('statWrap');
            statWrap.setAttribute('id', 'statTitle');
            const statLabel = document.createElement('div');
            statLabel.setAttribute('id', 'statLabel');
            statLabel.innerHTML = `${stat}:  `;
            statWrap.appendChild(statLabel);
            const statBarWrap = document.createElement('div');
            statBarWrap.classList.add('statBarWrap');
            statWrap.appendChild(statBarWrap);
            statBox.appendChild(statWrap);
            const statBar = document.createElement('div');
            statBar.classList.add('statBox');
            // for each stat, append one div with a red background
            // at intervals, increase the width of the div, for appearance of a bar growing:
            statBarWrap.appendChild(statBar);
            statBarWidth = 0;
            statBar.style.width = `${statBarWidth}%`;
            // loop through half the value of the stat, otherwise, it's too long:
            for (let i = 0; i < (statValue / 2); i++) {
                setTimeout(() => {
                    score += 1;
                    scoreBox.innerHTML = score;
                    statBarWidth += 1;
                    statBar.style.width = `${statBarWidth}px`;
                }, i * 20);
                // if you are at the end of the loop/ the value of the stat: 
                // append a dom element that will illustrate the total, and
                // have a CSS animation and glow:
                if (i === statValue / 2 - 1 || i === statValue / 2 - 0.5) {
                    setTimeout(() => {
                        const statNumberBox = document.createElement('div');
                        statNumberBox.classList.add('statNumberBox');
                        statNumberBox.innerHTML = stats[stat];
                        statBarWrap.appendChild(statNumberBox);
                    }, i * 25);
                }
            }
        });
    }
};