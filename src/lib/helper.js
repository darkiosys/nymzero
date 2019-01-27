function deck() {
  let deck = [
    {
      id: 1,
      image: '/assets/images/cards/zero.png',
      value: 0
    },
    {
      id: 2,
      image: '/assets/images/cards/zero.png',
      value: 0
    },
    {
      id: 3,
      image: '/assets/images/cards/zero.png',
      value: 0
    },
    {
      id: 4,
      image: '/assets/images/cards/zero.png',
      value: 0
    },
    {
      id: 5,
      image: '/assets/images/cards/ace_of_spades.png',
      value: 1
    },
    {
      id: 6,
      image: '/assets/images/cards/ace_of_spades.png',
      value: 1
    },
    {
      id: 7,
      image: '/assets/images/cards/ace_of_spades.png',
      value: 1
    },
    {
      id: 8,
      image: '/assets/images/cards/ace_of_spades.png',
      value: 1
    },
    {
      id: 9,
      image: '/assets/images/cards/2_of_spades.png',
      value: 2
    },
    {
      id: 10,
      image: '/assets/images/cards/2_of_spades.png',
      value: 2
    },
    {
      id: 11,
      image: '/assets/images/cards/2_of_spades.png',
      value: 2
    },
    {
      id: 12,
      image: '/assets/images/cards/2_of_spades.png',
      value: 2
    },
    {
      id: 13,
      image: '/assets/images/cards/3_of_spades.png',
      value: 3
    },
    {
      id: 14,
      image: '/assets/images/cards/3_of_spades.png',
      value: 3
    },
    {
      id: 15,
      image: '/assets/images/cards/3_of_spades.png',
      value: 3
    },
    {
      id: 16,
      image: '/assets/images/cards/3_of_spades.png',
      value: 3
    }
  ]
  return deck
}

function shuffle(deck) {
  let shuffledDeck = deck
  let i, j, tempi, tempj;
  for (i = 0; i < shuffledDeck.length; i += 1) {
      j = Math.floor(Math.random() * (i + 1));
      tempi = shuffledDeck[i];
      tempj = shuffledDeck[j];
      shuffledDeck[i] = tempj;
      shuffledDeck[j] = tempi;
  }
  return shuffledDeck
}

module.exports = {
  deck,
  shuffle,
}
