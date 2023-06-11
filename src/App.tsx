import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import {Player} from '../types/leaderboard'
import { Input } from './components/input';

const similarUpTo = (a: string, b: string): number => {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  for (; i < limit; i++) {
    if (a[i] !== b[i]) break;
  }
  return i
}

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

const countWords = (text: string) => {
  return text.split(" ").length;
}

enum TestState {
  NOT_STARTED = "Not started",
  RUNNING = "Running",
  DONE = "Done",
}

const prompts = [
  "Sometimes we make the process more complicated than we need to. We will never make a journey of a thousand miles by fretting about how long it will take or how hard it will be. We make the journey by taking each day step by step and then repeating it again and again until we reach our destination.",
  "Patience, he thought. So much of this was patience - waiting, and thinking and doing things right. So much of all this, so much of all living was patience and thinking.",
  "Men go abroad to wonder at the heights of mountains, at the huge waves of the sea, at the long courses of the rivers, at the vast compass of the ocean, at the circular motions of the stars, and they pass by themselves without wondering.",
  "Only the wise know just where predestination ends and free will begins. Meanwhile, you must keep on doing your best, according to your own clearest understanding. you must long for freedom as the drowning man longs for air. Without sincere longing, you will never find God.",
]

const sample = (arr: any[]) => {
  const choice = Math.floor(Math.random() * (arr.length - 1))
  return arr[choice]
}

const Leaderboard = (props: {leaderboard: Player[]}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-xl font-bold">Leaderboard:</h1>
      {props.leaderboard.map((el, i) => (
        <p>{i+1} | {el.username} | {el.wpm}wpm</p>
      ))}
    </div>
  )
}

function App() {
  const [sampleText, setSampleText] = useState(() => sample(prompts));
  const [userInput, setUserInput] = useState("")
  const [correctToIndex, setCTI] = useState(0);
  const [wps, setWps] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [testState, setTestState] = useState<TestState>(TestState.NOT_STARTED);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const wpm = Math.floor(wps * 60);
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [refetchLeaderboard, setRefetchLeaderboard] = useState(true);

  // derived states
  const correctText = sampleText.slice(0, correctToIndex)
  const wrongText = userInput.slice(correctToIndex)
  const remainderText = sampleText.slice(correctToIndex);

  // (re)fetching the leaderboard
  useEffect(() => {
    if(!refetchLeaderboard) return;
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
      if(username.length===0) return;
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
    setSampleText(sample(prompts));
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
        <Input value={username} placeholder="Put a username here" onChange={(ev) => {
          setUsername(ev.target.value);
        }} />
        <div className="flex items-center justify-between my-3">
          <div className="flex items-center gap-3">
            <button onClick={resetTest} disabled={testState !== TestState.DONE} className="disabled:opacity-20 dark:bg-white dark:text-black bg-black text-white">Reset</button>
            <p className="text-gray-400 italic">{testState}{testState === TestState.NOT_STARTED && ". Type to start"}</p>
          </div>
          {(testState === TestState.RUNNING || testState === TestState.DONE) && <p>{wpm} wpm</p>}
        </div>
        <div className="my-2">
          <p><span className='dark:text-yellow-300 text-green-700'>{correctText}</span><span className="bg-red-500 opacity-30">{wrongText}</span><Cursor />{remainderText}</p>
        </div>
        <Input value={userInput} onChange={handleInputChange} ref={hiddenInputRef} placeholder="Type here..." />
      </div>
      <Leaderboard leaderboard={leaderboardData}/>
    </div>
  )
}

export default App
