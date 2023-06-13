import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import '../App.css'
import axios from 'axios';
import { Player } from '../../types/leaderboard'
import { Button, Input, Leaderboard } from '../components';
import { countWords, sample, similarUpTo } from '../utils';
import { useAtom } from 'jotai';
import { globalUsername } from '../store';
import { databasePrompts } from '../utils/data';

const Cursor = () => {
	const [solid, setSolid] = useState(true);
	useEffect(() => {
		const int = setInterval(() => {
			setSolid(prev => !prev);
		}, 1000)
		return () => clearInterval(int);
	}, [])
	return (
		<span className="w-12">{solid ? (<span className="w-full h-full dark:bg-white white:bg-black border dark:border-white border-black" />) : (<span className="h-full bg-none border border-gray-300 dark:border-gray-500" />)}</span>
	)
}


export enum TestState {
	NOT_STARTED = "Not started",
	RUNNING = "Running",
	DONE = "Done",
}


function RacingPage() {
	const [sampleText, setSampleText] = useState(() => sample(databasePrompts).paragraph);
	const [userInput, setUserInput] = useState("")
	const [correctToIndex, setCTI] = useState(0);
	const [wps, setWps] = useState(0);
	const [secondsElapsed, setSecondsElapsed] = useState(0);
	const [testState, setTestState] = useState<TestState>(TestState.NOT_STARTED);
	const hiddenInputRef = useRef<HTMLInputElement>(null);
	const [username] = useAtom(globalUsername);
	const wpm = Math.floor(wps * 60);
	const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
	const [refetchLeaderboard, setRefetchLeaderboard] = useState(true);

	// derived states
	const correctText = sampleText.slice(0, correctToIndex)
	const wrongText = userInput.slice(correctToIndex)
	const remainderText = sampleText.slice(correctToIndex);

	// (re)fetching the leaderboard
	useEffect(() => {
		if (!refetchLeaderboard) return;
		axios.get("/api/get-leaderboard").then((res) => {
			setLeaderboardData(res.data?.data ?? []);
			setRefetchLeaderboard(false);
		})
	}, [refetchLeaderboard])

	useEffect(() => {
		// kick off timer by typing on the keyboard
		if (testState === TestState.NOT_STARTED && userInput.length > 0) {
			setTestState(TestState.RUNNING);
		}
		// done state
		if (userInput === sampleText) {
			setTestState(TestState.DONE);
			// save score in the leaderboard if has username
			if (username.length === 0) return;
			axios.post("/api/upsert-leaderboard", {
				username, wpm,
			}).then(() => {
				console.log("saved score to leaderboard")
				// refetch leaderboard
				setRefetchLeaderboard(true);
			}).catch((e) => {
				console.error(e);
			});
		}
	}, [userInput])

	// focus onto the hidden input so that people can type from the start
	useEffect(() => {
		console.log(hiddenInputRef.current);
		hiddenInputRef.current?.focus();
	}, [])

	// stopwatch
	useEffect(() => {
		const int = setInterval(() => {
			setSecondsElapsed(prev => {
				return prev + 1;
			});
		}, 1000);
		if (testState === TestState.DONE || testState === TestState.NOT_STARTED) {
			clearInterval(int);
			return;
		}
		return () => clearInterval(int);
	}, [testState])

	useEffect(() => {
		if (testState === TestState.DONE) {
			// disable the typing
			if (hiddenInputRef.current) hiddenInputRef.current.disabled = true;
		} else if (testState === TestState.NOT_STARTED) {
			// give back typing
			if (hiddenInputRef.current) hiddenInputRef.current.disabled = false;
			hiddenInputRef.current?.focus();
		}
	}, [testState])

	// recalculate velocity
	useEffect(() => {
		setWps(countWords(correctText) / secondsElapsed);
	}, [secondsElapsed])

	const resetTest = () => {
		setUserInput("");
		setWps(0 / 0);
		setCTI(0);
		setSecondsElapsed(0);
		setTestState(TestState.NOT_STARTED);
		setSampleText(sample(databasePrompts).paragraph);
	}

	const handleInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
		// space at beginning -> not allowed
		if (userInput.length === 0 && ev.target.value === " ") {
			return;
		}
		const last = ev.target.value[ev.target.value.length - 1];
		const secondLast = ev.target.value[ev.target.value.length - 2];
		// >=1 space at the end -> not allowed
		if (userInput.length > 0 && last === secondLast && last === " ") {
			return;
		}
		const sut = similarUpTo(ev.target.value, sampleText);
		setCTI(sut);
		setUserInput(ev.target.value);
	}

	return (
		<div className="flex gap-10">
			<div className="w-96 text-left">
				<p>User: <span className="font-bold">{username}</span></p>
				<div className="flex items-center justify-between my-3">
					<div className="flex items-center gap-3">
						<Button onClick={resetTest} disabled={testState !== TestState.DONE}>Reset</Button>
						<p className="text-gray-400 italic">{testState}{testState === TestState.NOT_STARTED && ". Type to start"}</p>
					</div>
					{(testState === TestState.RUNNING || testState === TestState.DONE) && <p>{wpm} wpm</p>}
				</div>
				<div className="my-2">
					<p><span className='dark:text-yellow-300 text-green-700'>{correctText}</span><span className="bg-red-500 opacity-30">{wrongText}</span><Cursor />{remainderText}</p>
				</div>
				<Input value={userInput} onChange={handleInputChange} ref={hiddenInputRef} placeholder="Type here..." />
			</div>
			<Leaderboard leaderboard={leaderboardData} />
		</div>
	)
}

export default RacingPage;
