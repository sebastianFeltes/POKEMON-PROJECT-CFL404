import pokbg from "./assets/woodbg.jpg";
import "./App.css";
import { pokemonData } from "./data/pokemonData";
import { useState, useRef, useEffect } from "react";
import AudioPlayer from "./Audio";
import punchSound from "./assets/Punch Sound Effect.mp3";

function App() {
	const [esMovil, setEsMovil] = useState(false);

	useEffect(() => {
		// Función para verificar si la resolución es menor que 600 (puedes ajustar este valor)
		const verificarResolucion = () => {
			setEsMovil(window.innerWidth < 750);
		};

		// Verificar inicialmente y agregar un listener para cambios en la ventana
		verificarResolucion();
		window.addEventListener("resize", verificarResolucion);

		// Limpiar el listener al desmontar el componente
		return () => {
			window.removeEventListener("resize", verificarResolucion);
		};
	}, []);

	const [isPlaying, setIsPlaying] = useState(false);
	const [getHitted, setGetHitted] = useState(undefined);
	const [gameOver, setGameOver] = useState(false);
	const [player, setPlayer] = useState({ isPlayer: true });
	const [pc, setPc] = useState({ isPlayer: false });
	const [actionLog, setActionLog] = useState(["Ready!"]);
	const [endMessage, setEndMessage] = useState(undefined);
	const [playerWin, setPlayerWin] = useState("retreat");
	const [isMusicPlaying, setIsMusicPlaying] = useState(false);

	const hitSound = new Audio(punchSound);

	const audioPlayerRef = useRef(null);
	function playPauseAudio() {
		audioPlayerRef.current.playPause();
		setIsMusicPlaying(!isMusicPlaying);
	}

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
		const playerEffectiveness = calculateEffectiveness(player.pokemonData.type, pc.pokemonData.type);

		setActionLog((actionLog) => [
			...actionLog,
			`${player.pokemonData.name.toUpperCase()} has used ${player.pokemonData.moves.toUpperCase()} causing ${Math.round(
				pc.pokemonData.life - playerDamage
			)} of damage`,
		]);

		const pcImg = document.getElementById("pokemonImagePc");
		hitSound.volume = 0.5;
		hitSound.play();
		pcImg.classList.add("pokemon-hitted");
		setTimeout(() => {
			pcImg.classList.remove("pokemon-hitted");
		}, 600);

		if (pcNewState.pokemonData.life <= 0) {
			setEndMessage("Victory!");
			setPlayerWin("victory");
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

				const pcEffectiveness = calculateEffectiveness(player.pokemonData.type, pc.pokemonData.type);
				hitSound.volume = 0.5;
				hitSound.play();
				setActionLog((actionLog) => [
					...actionLog,
					`${pc.pokemonData.name.toUpperCase()} has used ${pc.pokemonData.moves.toUpperCase()} causing ${Math.round(
						player.pokemonData.life - pcDamage
					)} of damage`,
				]);

				const pcImg = document.getElementById("pokemonImagePl");
				pcImg.classList.add("pokemon-hitted");
				setTimeout(() => {
					pcImg.classList.remove("pokemon-hitted");
				}, 600);
				if (playerNewState.pokemonData.life <= 0) {
					setEndMessage("Defeat!");
					setPlayerWin("defeat");
					return endGame();
				} else {
					setPlayer(playerNewState);
				}
			}, 500);
		}
	}

	function PlayerCard(pokemon) {
		return (
			<div
				className={`card w-1/3 m-2 h-fit bg-transparent shadow-xl shadow-black`}
				style={{
					border: "2px solid " + pokemon.pokemonData.color,
				}}
			>
				<div className="card-body">
					<h3>{pokemon.isPlayer ? "Player" : "Computer"}</h3>
					<h1
						className="text-center text-3xl font-bold"
						style={{
							textDecoration: "underline",
							textDecorationColor: pokemon.pokemonData.color,
						}}
					>
						{pokemon.pokemonData.name}
					</h1>
					<img
						id={"pokemonImage" + `${pokemon.isPlayer ? "Pl" : "Pc"}`}
						src={pokemon.pokemonData.image}
						alt="pokemon image"
						className={"w-60 ml-auto mr-auto "}
						style={{
							filter: `drop-shadow(0px 0px 20px ${pokemon.pokemonData.color})`,
						}}
					/>
					<div className="text-2xl bg-black bg-opacity-50 rounded-md p-2">
						<div className="text-xl">
							HP: {Math.round(pokemon.pokemonData.life)}
							<progress
								className={
									pokemon.pokemonData.life >= 2 * (pokemon.pokemonData.maxLife / 3)
										? `progress progress-success w-full h-4`
										: pokemon.pokemonData.life <= 2 * (pokemon.pokemonData.maxLife / 3) &&
										  pokemon.pokemonData.life >= pokemon.pokemonData.maxLife / 3
										? `progress progress-warning w-full h-4`
										: pokemon.pokemonData.life <= pokemon.pokemonData.maxLife / 3
										? `progress progress-error w-full h-4`
										: ``
								}
								value={
									Math.round(pokemon.pokemonData.life) >= 0
										? `${Math.round(pokemon.pokemonData.life)}`
										: "0"
								}
								max={`${Math.round(pokemon.pokemonData.maxLife)}`}
							></progress>
						</div>
						{/* <p>{Math.round(pokemon.pokemonData.life)}</p> */}
						<p>
							Type: <span style={{ color: pokemon.pokemonData.color }}>{pokemon.pokemonData.type}</span>
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
								Attack!
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

		if (!isMusicPlaying) {
			playPauseAudio();
		}
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
		const randomPokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
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
	function calculateDamage(attack, defense, attackLevel, defenseLevel, defenderLife) {
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

	return !esMovil ? (
		<div
			className="hero min-h-screen w-full bg-white m-0 p-0"
			style={{
				backgroundImage: `url(${pokbg})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="hero-overlay bg-opacity-40"></div>
			<AudioPlayer ref={audioPlayerRef} />
			<div className="hero-content min-w-full text-center text-neutral-content m-0 p-0">
				<div className="min-w-full text-white">
					{!isPlaying && !gameOver ? (
						<div className="card w-1/2 bg-black bg-opacity-50 shadow-xl ml-auto mr-auto">
							<div className="card-body">
								<h1 className="card-title mb-2 text-5xl font-bold">Pokemon Battle</h1>
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
							<div className="card-body">
								<h1
									className={`card-title-center mb-2 text-5xl font-bold ${
										playerWin == "victory"
											? `text-blue-500`
											: playerWin == "defeat"
											? `text-red-600`
											: `text-orange-400`
									}`}
								>
									{endMessage}
								</h1>
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
					) : (
						<div className="flex flex-row flex-wrap w-full h-full justify-center">
							{PlayerCard(player)}
							<div className="border border-white m-2 w-1/4 p-2 rounded-2xl h-full">
								<h2 className="text-center text-3xl font-bold max-h-full">Battle Log</h2>
								<div className="overflow-y-scroll h-96">
									{actionLog
										.map((e, index) => {
											return (
												<p
													key={index}
													className={`mx-4 p-2 italic border-b text-white font-semibold bg-black bg-opacity-30 rounded-lg`}
												>
													<span
														className={
															index % 2 == 0
																? "underline decoration-orange-700"
																: "underline decoration-blue-700"
														}
													>
														{index % 2 == 0 ? "Computer" : "Player"}
													</span>
													: {e}
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
	) : (
		<div
			className="hero h-screen w-screen bg-white"
			style={{
				backgroundImage: `url(${pokbg})`,
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="bg-white bg-opacity-40 w-full h-full flex flex-col justify-center">
				<p className="text-2xl text-center m-4 font-mono">LO SENTIMOS :/</p>
				<p className="text-xl text-center m-4 font-mono">
					PERO ESTE JUEGO NO SE PUEDE JUGAR DESDE UN DISPOSITIVO CON UN ANCHO DE PANTALLA MENOR A 750
				</p>
			</div>
		</div>
	);
}

export default App;
