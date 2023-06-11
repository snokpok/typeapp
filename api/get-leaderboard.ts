import {getTopNLeaderboard} from '../services/leaderboard'

export const config = {
  runtime: 'edge',
};
 
export default async (request: Request) => {
  const res = await getTopNLeaderboard(10);
  return new Response(JSON.stringify({
    "data": res
  }));
};