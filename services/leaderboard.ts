import {kv} from '@vercel/kv'
import { Player } from '../types/leaderboard';

const leaderboardNamespace = "leaderboard"

export const getTopNLeaderboard = async (N: number): Promise<Player[]> => {
	const res = await kv.zrange(leaderboardNamespace, 0, N, {
		withScores: true,
		rev: true,
	});
	const data: Player[] = []
	for (let i=0; i<res.length; i+=2) {
		data.push({username: String(res[i]), wpm: Number(res[i+1])});
	}
	return data;
}

export const upsertScoreLeaderboard = async (score: number, username: string) => {
	await kv.zadd(leaderboardNamespace, {score, member: username});
}