# Play Principles

*Lovable by Design, applied to games. Offered to any studio that wants to make games people are glad they played.*

[DESIGN-PHILOSOPHY.md](../../DESIGN-PHILOSOPHY.md) asks every OpenCosmos expression one tiebreaker question: *what would delight the human, create joy, or expand their degrees of freedom?* Games put that question under more pressure than any other medium. They can hold attention better than anything else we make, so they are the easiest place to take it. These principles are the answer this ecosystem's games give. The first is [Xensō](https://opencosmos.ai/xenso), a game you play as yourself; a game for children is in development on the same ground.

They are written for makers, not players. Each one comes with a test, because a principle you cannot check is only a mood.

---

## 1. The relationship to what is met is the real subject

The standard loop goes enter, destroy, triumph, exit, repeat. These games don't remove conflict; they make **how the player meets the difficult thing** the thing the game is about. A fearsome creature can be met with compassion. A real-life challenge can be given a shape instead of being fled.

*Test:* describe your core loop without the words *defeat*, *kill*, *beat*, or *clear*. If nothing is left, the loop is borrowed.

## 2. Allies, not assets

Living things in the game are **beings, not resources**. They aren't captured, farmed, spent, collected for score, or destroyed by default. Destruction, if the design allows it at all, is kept for what is genuinely against life, and the design says so plainly.

*Test:* could a player tell a friend, truthfully, "I have a companion" rather than "I own a unit"?

## 3. The ethic is felt, never explained

The philosophy is the foundation, never the product. If a narrator has to tell the player what the moral is, the design has failed. **The ethic lives in what the game rewards, what it makes possible, and what it quietly declines to offer.** Children especially learn from what the game lets them *do*, not from what it says.

*Test:* remove every line of moralizing text. Does the game still teach the same thing?

## 4. The player is the author

Where a game touches a player's real life, **the player's words are the player's**. An AI companion in the game is a mirror and a light, never the author. It reflects, asks, notices, and offers, but it never names the player's goal, challenge, or insight before they have.

*Test:* audit every string the system writes into the player's record. Did the player say it first?

## 5. Counts are libraries, not scores

A collection of what the player has gathered or learned is a treasury. A number that ranks them, against others or against their own yesterday, **reintroduces the comparison-mind** most people come to play to escape. Use no points as motivation, no visible scalar of worth, and no leaderboards for the inner life.

*Test:* could a player's progress be shown to a stranger without either of them feeling measured?

## 6. No engineered compulsion

Use **none of these:**

- streaks
- energy timers
- loot boxes
- fear of missing out
- nags or badges
- push notifications that pull
- "your companion is sad" guilt

A game that is good enough doesn't need to be hard to put down; it needs to be easy to come back to. **Measure growth, not engagement.** Session length is not a virtue.

*Test:* if a player stopped for a month, would anything in the game punish them, or pressure them to return?

## 7. Every failure has somewhere honourable to land

Letting go of a goal can be wisdom, not failure. A player who has done harm can always be redeemed. A child who is stuck gets a gentle hint and an instant retry. **A system that only knows won and lost quietly punishes the player for being human.**

*Test:* list every way a session can end. Does each one leave the player with dignity?

## 8. Sustain without extraction

**Games that serve people should earn a living for the people who make them.** A gift economy that starves its maker is not generosity. The line is not free versus paid; it is **value given versus value taken**:

- **Charge for** craft, and for costs that are real: hosting, inference, sync, human facilitation.
- **Never charge for** relief from friction the game manufactured.
- **Never sell** attention or data.

A player pays, if they pay, *because nothing else was taken*.

*Test:* could you publish your revenue model, and what it pays for, on the game's own home screen without embarrassment?

## 9. Privacy by architecture

Keep data on the device first and under the player's control, with no account required to play. Get explicit consent before anything personal reaches a third-party service. **For children, collect nothing:**

- no third-party analytics or advertising SDKs
- no camera or microphone capture
- a parental gate before every link and purchase

The simplest defence under every children's privacy law is to have nothing to defend.

*Test:* what is on your App Privacy label? For a children's game, the right answer is "Data Not Collected".

## 10. Know what the game is not

A game can hold grief, fear, and real difficulty; it cannot be a clinician, a lawyer, or a financial adviser. **When a player needs a professional, the game says so plainly and warmly, points to real help, and then offers what it can do.** A growth game is not a treatment, and it shouldn't claim to be one.

*Test:* write the three hardest things a player might bring. Does your design answer each one with a handoff, not a performance?

## 11. The player controls their experience

User Control & Freedom, at play:

- **Motion 0 works perfectly** ([ADR 0012](../decisions/0012-motion-intensity-zero-is-a-first-class-mode.md)).
- Haptics have an off switch.
- Sound has captions and visual cues, so muted play loses nothing.
- Text scales, colour is never the only signal, and one-handed or left-handed play is designed, not tolerated.

*Test:* play your game at motion 0, muted, with haptics off and text at the largest size. Is it still the game?

## 12. Show the receipts

Transparent by Design, at play. Be open about how the game was made, **including the AI collaboration**. Keep a provenance record for every generated asset: tool, plan, date, prompt, licence, human edits. Make the game's ethic and business model legible to anyone who asks.

*Test:* could a player, a parent, or a reviewer find out how any asset in your game was made?

---

## Using these

These principles are MIT-licensed with the rest of this repository: take them, adapt them, argue with them. If your studio adopts them, the most useful thing you can send back is a case where one of them was hard to keep, and what you did.

*Distilled on 2026-09-27 from the working canon of the ecosystem's games, whose full design and vows live with each game. Why this lives in a design-system repository: [ADR 0015](../decisions/0015-the-commons-for-play-lives-beside-the-design-system.md).*
