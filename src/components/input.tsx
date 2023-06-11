import { DetailedHTMLProps, InputHTMLAttributes } from "react"

export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export const Input = (props: InputProps) => {
	return (
		<input {...props} className="opacity-100 border border-gray-500 disabled:opacity-50 p-3 rounded"/>
	)
}