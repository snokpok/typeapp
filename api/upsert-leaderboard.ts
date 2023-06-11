import {upsertScoreLeaderboard} from '../services/leaderboard'

export const config = {
  runtime: 'edge',
};
 
export default async (request: Request) => {
  if(request.method==="POST") {
    const body = await request.json()
    if(!body || !body.username || !body.wpm) {
      return new Response(JSON.stringify({
        "error": "Must provide {username: string, wpm: string} or a body",
      }));
    }
    await upsertScoreLeaderboard(body.wpm, body.username);
    return new Response(JSON.stringify({
      "message": "OK"
    }));
  } else {
    const resp = new Response(JSON.stringify({
      "error": "Invalid method"
    }));
    return resp;
  }
};
