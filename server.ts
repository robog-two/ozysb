import { Application, Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";

const kv = await Deno.openKv();
const router = new Router();
const app = new Application();

interface Player {
  username: string;
  score: number;
}

router.get("/", (ctx) => {
  ctx.response.body = "Hello world!";
});

router.get("/highscores", async (ctx) => {
  const response = { one: { score: 0 }, two: { score: 0 }, three: { score: 0 } };
  const records = kv.list({ prefix: ["players"] });
  const list: Player[] = [];
  for await (const pair of records) {
    list.push(pair.value as Player);
  }

  for (const pair of list) {
    console.log(pair);
    if (pair.score >= response.one.score) {
      response.three = response.two;
      response.two = response.one;
      response.one = pair;
      break;
    }
    if (pair.score >= response.two.score) {
      response.three = response.two;
      response.two = pair;
      break;
    }
    if (pair.score >= response.three.score) {
      response.three = pair;
      break;
    }
  }
  ctx.response.body = response;
});

router.post("/setnewhighscore", async (ctx) => {
  try {
    const json = await ctx.request.body.json();
    if (json.username === undefined || json.score === undefined) {
      ctx.response.status = 500;
      return;
    }
    const player: Player = { username: json.username, score: json.score };
    await kv.set(["players", player.username], player)
    ctx.response.status = 200;
  } catch (e: any) {
    console.log(e);
    ctx.response.status = 500;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });

