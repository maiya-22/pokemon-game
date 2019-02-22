/* eslint func-names: 0,  no-unused-vars: 0, no-alert: 0, class-methods-use-this: 0 , no-plusplus: 0 , indend: 0 , no-restricted-syntax: 0 , no-use-before-define: 0 , no-loop-func: 0, func-names: 0, space-before-blocks: 0, indent: 0, max-len: 0 */
// The comments above are just to remove error messages from my VS Code

window.onload = function (evt) {

    const createPlayer = (name, characterNames = ['character-name one', 'character-name two', 'character-name three']) => {
        let playerNumbers = "playerOne playerTwo".split(' ')
        let Player = {
            name: name,
            score: 0,
            characters: {},
            charactersLoaded: false,
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

        // helper function takes the large ammount of data returned from the api and reformats just the info that we need into a simple object:
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
                }).catch(err => {
                    // if there is an error, load backup data
                    reject(err);
                }).finally(() => {
                    resolve(Player);
                });
        });
    }
    // end of createPlayer function

    // CREATING THE GAME:
    let playButtons = document.getElementsByClassName('play-button');

    let playerOneName = "professor grim";
    let playerOneCharacters = ["oddish", "gloom", "weezing"];
    let playerTwoName = "chuck";
    let playerTwoCharacters = ["dragonair", "butterfree", "charmeleon"];

    const game = {
        playerOne: null,
        playerTwo: null,
        winner: null
    };

    createPlayer("professor grim", ['oddish', 'gloom', 'weezing'])
        .then(playerObject => {
            game.playerOne = {};
            game.playerOne = playerObject;
            console.log("GAME", game);

            return createPlayer("chuck", ['dragonair', 'butterfree', 'charmeleon'])
        }).then(playerObject => {
            game.playerTwo = {};
            game.playerTwo = playerObject;
        }).catch(err => {
            console.log("error in create players chain:", err)
        }).finally(() => {
            // buttons start spinning when game can be played:
            for (let i = 0; i < playButtons.length; i++) {
                let button = playButtons[i];
                button.classList.add("spinningButtons");
            }
        })

    // NOW ANIMATE THE GAME:
    // click listener: if you click a character button, the event-listener will fire a function to play a round:
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
        console.log("game:", game)
        let { stats } = character;

        // get the player's DOM elements:
        let scoreBox = document.getElementById(`${playerName}-score-box`);
        let statBox = document.getElementById(`${playerName}-stat-box`);
        let nameBox = document.getElementById(`${playerName}-name-box`);
        let instructions = document.getElementById(`${playerName}-instructions`);



        nameBox.innerHTML = "";
        let characterNameDisplay = document.createElement('div');
        characterNameDisplay.classList = "current-character-name";
        characterNameDisplay.innerHTML = character.name[0].toUpperCase() + character.name.slice(1);

        setTimeout(() => {
            nameBox.appendChild(characterNameDisplay);
        }, 10);

        // console.log("characterNameDisplay", characterNameDisplay);
        console.log("nameBox", nameBox);
        // nameBox.appendChild(characterNameDisplay);

        statBox.innerHTML = "";
        // DRAW the stats animation:
        // Add the HTML/DOM elements that will be labels for the stats and contain a bar that measures the stat:
        let statNames = Object.keys(stats);
        statNames.forEach(stat => {
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
            for (let i = 0; i < statValue; i++) {
                setTimeout(() => {
                    score += 1;
                    scoreBox.innerHTML = score;
                    const statBox = document.createElement('div');
                    statBox.classList.add('statBox');
                    statBarWrap.appendChild(statBox);
                }, i * 20);
                // if the current box-number is at the actual stat value, then add the statNumber here and break out of loop:
                if (i === statValue - 1) {
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