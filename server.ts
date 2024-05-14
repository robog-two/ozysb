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
  ctx.response.body = await kv.list({ prefix: ["players"] });
});

router.post("/setnewhighscore", async (ctx) => {
  try {
    const player = ctx.request.body as unknown as Player;
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

