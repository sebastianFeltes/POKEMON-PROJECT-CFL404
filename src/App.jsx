import pokbg from "./assets/woodbg.jpg";
import "./App.css";
import { pokemonData } from "./data/pokemonData";
import { useState } from "react";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [endCode, setEndCode]= useState(0);
  const [player, setPlayer] = useState({ isPlayer: true });
  const [pc, setPc] = useState({ isPlayer: false });
  const [actionLog, setActionLog] = useState(["Ready!"]);
  const [endMessage, setEndMessage] = useState(undefined);
  function attack() {
    const playerDamage = calculateDamage(
      player.pokemonData.type,
      pc.pokemonData.type,
      player.pokemonData.level,
      pc.pokemonData.level,
      pc.pokemonData.life
    );
    const newPcData = { ...pc.pokemonData, life: playerDamage };
    const pcNewState = { ...pc, pokemonData: newPcData };
    const playerEffectiveness = calculateEffectiveness(
      player.pokemonData.type,
      pc.pokemonData.type
    );
    setActionLog((actionLog) => [
      ...actionLog,
      `${player.pokemonData.name} has used ${player.pokemonData.moves}, ${
		  playerEffectiveness == 3 ? "is effective" : "is not effective"
		}`,
    ]);
    // pcNewState.pokemonData.life <= 0 ? alert("Victory!")&&endGame() : false;
    if (pcNewState.pokemonData.life <= 0) {
		setEndMessage("Victory!");
		setEndCode(1)
		console.log(endCode)
		return endGame();
    } else {
		setPc(pcNewState);
		
		setTimeout(() => {
			const pcDamage = calculateDamage(
          pc.pokemonData.type,
          player.pokemonData.type,
          pc.pokemonData.level,
          player.pokemonData.level,
          player.pokemonData.life
		  );
		  const newPlayerData = { ...player.pokemonData, life: pcDamage };
		  const playerNewState = { ...player, pokemonData: newPlayerData };
		  
		  const pcEffectiveness = calculateEffectiveness(
			  player.pokemonData.type,
			  pc.pokemonData.type
			  );
			  setActionLog((actionLog) => [
				  ...actionLog,
				  `${pc.pokemonData.name} has used ${pc.pokemonData.moves}, ${
					  pcEffectiveness == 3 ? "is effective" : "is not effective"
					}`,
				]);
				if (playerNewState.pokemonData.life <= 0) {
					setEndMessage("Defeat!");
					setEndCode(2)
					console.log(endCode)
					return endGame();
				} else {
					setPlayer(playerNewState);
				}

        //endGame();
      }, 500);
    }
  }

  function PlayerCard(pokemon) {
    return (
      <div
        className={`card w-1/4 m-2 h-fit bg-transparent shadow-xl shadow-black border-2 border-white`}
      >
        <div className="card-body">
          <h3>{pokemon.isPlayer ? "Player" : "Computer"}</h3>
          <h1
            className="text-center text-5xl font-bold"
            style={{
              textDecoration: "underline",
              textDecorationColor: pokemon.pokemonData.color,
            }}
          >
            {pokemon.pokemonData.name}
          </h1>
          <img
            src={pokemon.pokemonData.image}
            alt="pokemon image"
            className="w-60 ml-auto mr-auto"
            style={{
              filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
            }}
          />
          <div className="text-2xl bg-black bg-opacity-50 rounded-md">
            <progress
              className="progress progress-success w-56 border border-white"
              value={
                Math.round(pokemon.pokemonData.life) >= 0
                  ? `${Math.round(pokemon.pokemonData.life)}`
                  : "0"
              }
              max={`${Math.round(pokemon.pokemonData.maxLife)}`}
            ></progress>
            {/* <p>{Math.round(pokemon.pokemonData.life)}</p> */}
            <p>
              Type:{" "}
              <span style={{ color: pokemon.pokemonData.color }}>
                {pokemon.pokemonData.type}
              </span>
            </p>
            <p>Level: {pokemon.pokemonData.level}</p>
          </div>
          {pokemon.isPlayer ? (
            <div className="card-actions justify-between">
              <button
                className="btn bg-gray-800 text-white border border-white"
                style={{
                  filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
                }}
                onClick={retreat}
              >
                Run...
              </button>
              <button
                className="btn bg-red-800 hover:bg-red-600 hover:text-white text-slate-200 border hover:border-white"
                style={{
                  filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
                }}
                onClick={attack}
              >
                Fight
              </button>
            </div>
          ) : (
            <div className="card-actions justify-between">
              <button
                disabled
                className="btn bg-gray-800 text-white border border-white"
                style={{
                  filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
                }}
              >
                Run...
              </button>
              <button
                disabled
                className="btn bg-red-800 hover:bg-red-600 hover:text-white text-slate-200 border hover:border-white"
                style={{
                  filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
                }}
              >
                Fight!
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function startGame() {
    const playerPok = chooseRandomPokemon();
    const pcPok = chooseRandomPokemon();

    setIsPlaying(true);
    setGameOver(false);
    setPlayer({ ...player, pokemonData: playerPok });
    setPc({ ...pc, pokemonData: pcPok });
  }

  function endGame() {
    setIsPlaying(false);
    setGameOver(true);
    setPlayer({ isPlayer: true });
    setPc({ isPlayer: false });
    setActionLog(["Ready!"]);
  }

  //ABANDONAR PARTIDA

  function retreat() {
    setEndMessage("Run away safely!");
    endGame();
  }
  //CALCULAR LA VIDA
  function calculateLife(nivel) {
    return nivel * 100;
  }
  //FUNCIÓN "PICKER" DE LOS POKEMON
  function chooseRandomPokemon() {
    const randomPokemon =
      pokemonData[Math.floor(Math.random() * pokemonData.length)];
    const randomLevel = Math.floor(Math.random() * 10) + 1;
    const maxLife = calculateLife(randomLevel);
    const life = calculateLife(randomLevel);

    return {
      ...randomPokemon,
      level: randomLevel,
      life: life,
      maxLife: maxLife,
    };
  }

  // FUNCION PARA CALCULAR EL DAÑO SEGUN TIPO, NIVEL
  function calculateDamage(
    attack,
    defense,
    attackLevel,
    defenseLevel,
    defenderLife
  ) {
    function lucky() {
      // Genera un número aleatorio entre 0 (inclusive) y 1 (exclusivo)
      const numeroAleatorio = Math.random();
      // Ahora, ajusta el número aleatorio para obtener 1, 5 o 10
      if (numeroAleatorio < 0.33) {
        return 1;
      } else if (numeroAleatorio < 0.66) {
        return 2;
      } else {
        return 3;
      }
    }
    const effectiveness = calculateEffectiveness(attack, defense);
    /* const damage = attackLevel * defenseLevel * effectiveness * lucky(); */
    const damage = 50 * (attackLevel / defenseLevel) * effectiveness * lucky();
    defenderLife -= damage;
    return defenderLife;
  }

  // FUNCION PARA CALCULAR LA EFECTIVIDAD
  function calculateEffectiveness(attack, defense) {
    if (attack === "Water" && defense === "Fire") {
      return 3;
    } else if (attack === "Fire" && defense === "Rock") {
      return 3;
    } else if (attack === "Rock" && defense === "Electric") {
      return 3;
    } else if (attack === "Electric" && defense === "Water") {
      return 3;
    } else if (attack === defense) {
      return 1;
    } else {
      return 0.5;
    }
  }

  return (
    <div
      className="hero min-h-screen w-full bg-white m-0 p-0"
      style={{
        backgroundImage: `url(${pokbg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="hero-overlay bg-opacity-40"></div>
      <div className="hero-content min-w-full text-center text-neutral-content m-0 p-0">
        <div className="min-w-full text-white">
          {!isPlaying && !gameOver ? (
            <div className="card w-1/2 bg-black bg-opacity-50 shadow-xl ml-auto mr-auto">
              <div className="card-body">
                <h1 className="card-title mb-2 text-5xl font-bold">
                  Pokemon Battle
                </h1>
                <p>To start a new pokemon battle, press start...</p>
                <div className="card-actions justify-end">
                  <button
                    onClick={startGame}
                    className="btn bg-blue-800 text-white border border-white hover:bg-blue-300 hover:text-blue-950"
                  >
                    Start!
                  </button>
                </div>
              </div>
            </div>
          ) : !isPlaying && gameOver ? (
            <div className="card w-1/2 bg-black bg-opacity-50 shadow-xl ml-auto mr-auto">
              <div className="card-body text-center">
                <h1 className={"mb-2 text-center text-5xl font-bold"+endCode==1?" text-sky-500":endCode==2?" text-red-500":endCode==0?" text-orange-500":false}>
                  {endMessage}
                </h1>
                <button
                  onClick={startGame}
                  className="btn bg-blue-800 text-white border border-white hover:bg-blue-300 hover:text-blue-950"
                >
                  Start!
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap w-full h-full justify-center">
              {PlayerCard(player)}
              <div className="border border-white m-2 w-1/4 p-2 rounded-2xl h-full">
                <h2 className="text-center text-3xl font-bold max-h-full">
                  Battle Log
                </h2>
                <div className="overflow-y-scroll max-h-96">
                  {actionLog
                    .map((e) => {
                      return (
                        <p key={[e]} className="m-4 italic">
                          {e}
                        </p>
                      );
                    })
                    .reverse()}
                </div>
              </div>
              {PlayerCard(pc)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
