class AudioController {
    constructor() {
        this.backgroundMusic = new Audio("../res/Audio/christmas.mp3");
        this.flipSound = new Audio("../res/Audio/flip.wav");
        this.matchSound = new Audio("../res/Audio/match.wav");
        this.victorySound = new Audio("../res/Audio/victory.wav");
        this.gameOverSound = new Audio("../res/Audio/gameover.wav");
    }

    /*
    * Start background music
    */
    startBGMusic() {
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;
        this.backgroundMusic.play();
    }

    /*
    * Stop background music
    */
    stopBGMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
    
    /*
    * Flip sound
    */
    flip() {
        this.flipSound.play();
    }

    /*
    * Matched card sound
    */
    match() {
        this.matchSound.play();
    }

    /*
    * Victory sound
    */
    victory() {
        this.stopBGMusic();
        this.victorySound.play();
    }

    /*
    * Game over sound
    */
    gameOver() {
        this.stopBGMusic();
        this.gameOverSound.play();
    }
}

class CardMatchGame {
    constructor(timeTotal, cards) {
        this.cardsArray = cards;
        this.timeTotal = timeTotal;
        this.timeRemaining = timeTotal;
        this.timer = document.getElementById('time-remaining');
        this.numFlips = document.getElementById('flips');
        this.audioController = new AudioController();
    }

    /*
    * Public Function: Initialize and Launch game
    */ 
    startGame() {
        this.cardToCheck = null; // First card flip to check second card flip against
        this.totalClicks = 0;
        this.timeRemaining = this.timeTotal;
        this.matchedCards = []; // Array to hold all matched cards
        this.busy = true; // Flag to indicate

        setTimeout(function() {
            this.audioController.startBGMusic();
            this._shuffleCards();
            this.countDown = this._startCountDown();
            this.busy = false;
        }.bind(this), 500);

        this._hideCards();
        this.timer.innerText = this.timeRemaining;
        this.numFlips.innerText = this.totalClicks;
    }

    /*
    * Public Function: Flip clicked card
    * Parameters:
    *   card - card to flip
    */
    flipCard(card) {
        var canFlipCard = this._canFlipCard(card);

        if (canFlipCard) {
            this.audioController.flip();
            this.totalClicks++;
            this.numFlips.innerText = this.totalClicks;
            card.classList.add('visible');

            if (this.cardToCheck != null) {
                if (this._isCardMatch(card)) {
                    this._cardMatched(card, this.cardToCheck);
                } else {
                    this._cardNotMatched(card, this.cardToCheck);
                }
                this.cardToCheck = null;
            } else {
                this.cardToCheck = card;
            }

        }
    }

    /*
    * Private Function: Re-flip all cards
    */
    _hideCards() {
        this.cardsArray.forEach(function(card) {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    /*
    * Private Function: Return true if card pair matches
    */
    _isCardMatch(card) {
        if (this._getCardType(card) == this._getCardType(this.cardToCheck)) {
            return true;
        }
        return false;
    }

    /*
    * Private Function: Mark matched cards
    */
    _cardMatched(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();

        if (this.matchedCards.length == this.cardsArray.length) {
            this._victory();
        }
    }

    /*
    * Private Function: Flip over selected card pair
    */
    _cardNotMatched(card1, card2) {
        this.busy = true;

        // Timeout allows for a 1s delay for cards to flip back over before any click action can occur again
        setTimeout(function() {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }.bind(this), 1000);
        
    }

    /*
    * Private Function: Return card type
    */
    _getCardType(card) {
        var cardSrc = card.getElementsByClassName('card-value')[0].src;

        return cardSrc;
    }

    /*
    * Private Function: Start count down timer
    */
    _startCountDown() {
        return setInterval(function() {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0) {
                this._gameOver();
            }
        }.bind(this), 1000);
    }

    /*
    * Private Function: Game over function
    */
    _gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('overlay-text-end').innerText = "Game Over";
        document.getElementById('overlay-end').classList.add('visible');
    }

    /*
    * Private Function: Victory Function
    */
    _victory() {
        clearInterval(this.countDown);
        this.audioController.victory();
        document.getElementById('overlay-text-end').innerText = "You Win";
        document.getElementById('overlay-end').classList.add('visible');
    }

    /*
    * Private Function: Shuffle cards with implementation of Fisher-Yates shuffle algorithm
    */
    _shuffleCards() {
        for (var i = this.cardsArray.length - 1; i > 0; i--) {
            // Obtain random index
            var randIndex = Math.floor(Math.random() * (i+1));
            
            // Swap order of two cards
            // Order is css grid property
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex;
        }

    }

    /*
    * Private Function: Return true if card can be flipped
    */
    _canFlipCard(card) {
        if (this.busy == true || card == this.cardToCheck || this.matchedCards.includes(card)) {
            return false;
        }
        
        return true;
    }

}

// Wait until all DOM content is loaded before starting game up
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', startup());
} else {
    startup();
}

/*
* Function: Start up game
*/
function startup() {
    var overlays = Array.from(document.getElementsByClassName('overlay-text'));
    var cards = Array.from(document.getElementsByClassName('card'));
    var game = new CardMatchGame(100, cards);


    overlays.forEach(function(overlay) {
        overlay.addEventListener("click", function() {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(function(card) {
        card.addEventListener("click", function() {
            game.flipCard(card);
        });
    });
}