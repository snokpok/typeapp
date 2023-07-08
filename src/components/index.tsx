import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  InputHTMLAttributes,
} from "react";
import { faker } from "@faker-js/faker";
import { Player } from "../../types/leaderboard";

export type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props: InputProps, ref) => {
    return (
      <input
        {...props}
        className="opacity-100 border border-gray-500 disabled:opacity-50 p-3 rounded"
        ref={ref}
      />
    );
  }
);

const leaderboardMock: Player[] = Array.from(Array(10).keys()).map(() => ({
  username: faker.internet.userName(),
  wpm: faker.number.int({
    min: 0,
    max: 600,
  }),
}));

export const Leaderboard = ({
  leaderboard = import.meta.env.DEV ? leaderboardMock : [],
}: {
  leaderboard?: Player[];
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-xl font-bold">Leaderboard:</h1>
      <table>
        <tr className="border border-gray-700">
          <th className="px-3 rounded">Rank</th>
          <th className="px-3">Username</th>
          <th className="px-3 rounded">Latest WPM</th>
        </tr>
        {leaderboard.map((el, i) => (
          <tr className="border border-gray-800">
            <td>{i + 1}</td>
            <td>{el.username}</td>
            <td>{el.wpm}wpm</td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export const Button = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`disabled:opacity-20 dark:bg-white dark:text-black bg-black text-white ${className}`}
    {...props}
  >
    {children}
  </button>
);
