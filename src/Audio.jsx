import React, { useState, useEffect } from "react";
import pokemonAudio from "./assets/Pokemon Red, Yellow, Blue Battle Music- Trainer.mp3";
import playIco from "./assets/play-button.png";
import stopIco from "./assets/stop.png";
import pauseIco from "./assets/pause.png";
import volumeIco from "./assets/medium-volume.png";

const AudioPlayer = React.forwardRef((props, ref) => {
	const [audio] = useState(new Audio(pokemonAudio));
	const [volume, setVolume] = useState(0.5);
	const [isPaused, setIsPaused] = useState(true);

	// Use useEffect to update the audio volume when the prop changes
	useEffect(() => {
		audio.volume = volume;
	}, [volume]);

	// Play/Pause function that calls the provided onPlayPause callback
	const playPauseAudio = () => {
		if (isPaused) {
			audio.play();
			setIsPaused(false);
		} else {
			audio.pause();
			setIsPaused(true);
		}
	};

	// Stop function that calls the provided onStop callback
	const stopAudio = () => {
		audio.pause();
		audio.currentTime = 0;
		setIsPaused(true);
	};

	// Handle volume change and call the provided onVolumeChange callback
	const handleVolumeChange = (event) => {
		const newVolume = event.target.value;
		setVolume(newVolume);
	};

	// Utiliza ref para exponer la función playPause
	React.useImperativeHandle(ref, () => ({
		playPause: playPauseAudio,
	}));

	return (
		<div className="dropdown dropdown-hover absolute top-0 left-0 z-50 ">
			<label tabIndex={0} className="btn bg-opacity-10 bg-base-100">
				Music
			</label>
			<ul
				tabIndex={0}
				className="dropdown-content z-[1] menu p-2 shadow rounded-box w-52 bg-opacity-80 bg-base-100"
			>
				<li className="flex flex-row justify-between">
					<button className="btn btn-info btn-outline w-16 m-1" onClick={playPauseAudio}>
						{isPaused ? (
							<img className="w-16" src={playIco} alt="" />
						) : (
							<img className="w-16" src={pauseIco} alt="" />
						)}
					</button>
					<button className="btn btn-outline btn-error w-16 m-1" onClick={stopAudio}>
						<img className="w-16" src={stopIco} alt="" />
					</button>
				</li>

				<li>
					<div className="flex flex-row justify-center items-center">
						<img src={volumeIco} className="w-8" alt="" />
						<input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
					</div>
				</li>
			</ul>
		</div>
	);
});
AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
