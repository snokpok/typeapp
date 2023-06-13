import React, { ButtonHTMLAttributes, DetailedHTMLProps, InputHTMLAttributes } from "react"
import { Player } from "../../types/leaderboard"

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props: InputProps, ref) => {
	return (
		<input {...props} className="opacity-100 border border-gray-500 disabled:opacity-50 p-3 rounded" ref={ref}/>
	)
})

export const Leaderboard = (props: {leaderboard: Player[]}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-xl font-bold">Leaderboard:</h1>
      {props.leaderboard.map((el, i) => (
        <p>{i+1} | {el.username} | {el.wpm}wpm</p>
      ))}
    </div>
  )
}


export const Button = ({className, children, ...props}: ButtonHTMLAttributes<HTMLButtonElement>) => <button className={`disabled:opacity-20 dark:bg-white dark:text-black bg-black text-white ${className}`} {...props}>{children}</button>
