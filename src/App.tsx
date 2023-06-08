import { useEffect, useRef, useState } from 'react'
import './App.css'

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
    <span className="w-12">{solid ? (<span className="w-full h-full bg-white border border-white" />) : (<span className="h-full bg-none border border-white" />)}</span>
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
  const choice = Math.floor(Math.random() * (arr.length-1))
  return arr[choice]
}

function App() {
  const [sampleText, setSampleText] = useState(() => sample(prompts));
  const [userInput, setUserInput] = useState("")
  const [correctToIndex, setCTI] = useState(0);
  const [wps, setWps] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [testState, setTestState] = useState<TestState>(TestState.NOT_STARTED);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // derived states
  const correctText = sampleText.slice(0, correctToIndex)
  const wrongText = userInput.slice(correctToIndex)
  const remainderText = sampleText.slice(correctToIndex);

  useEffect(() => {
    // kick off timer by typing on the keyboard
    if (testState === TestState.NOT_STARTED && userInput.length > 0) {
      setTestState(TestState.RUNNING);
    }
    // done state
    if (userInput === sampleText) {
      setTestState(TestState.DONE);
    }
  }, [userInput])

  // focus onto the hidden input so that people can type
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
    setWps(0/0);
    setCTI(0);
    setSecondsElapsed(0);
    setTestState(TestState.NOT_STARTED);
    setSampleText(sample(prompts));
  }

  return (
    <>
      <div className="w-96 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={resetTest} disabled={testState !== TestState.DONE} className="disabled:opacity-20">Reset</button>
            <p className="text-gray-400 italic">{testState}{testState===TestState.NOT_STARTED && ". Type to start"}</p>
          </div>
          {(testState===TestState.RUNNING || testState===TestState.DONE) && <p>{Math.floor(wps * 60)} wpm</p>}
        </div>
        <div>
          <p><span className='text-yellow-300'>{correctText}</span><span className="bg-red-500 opacity-30">{wrongText}</span><Cursor />{remainderText}</p>
        </div>
        <input value={userInput} onChange={(ev) => {
          // space at beginning -> not allowed
          if(userInput.length===0 && ev.target.value===" ") {
            return;
          }
          const last = ev.target.value[ev.target.value.length-1];
          const secondLast = ev.target.value[ev.target.value.length-2];
          // >=1 space at the end -> not allowed
          if(userInput.length>0 && last===secondLast && last === " ") {
            return;
          }
          const sut = similarUpTo(ev.target.value, sampleText);
          setCTI(sut);
          setUserInput(ev.target.value);
        }} ref={hiddenInputRef} className="opacity-0" />
      </div>
    </>
  )
}

export default App