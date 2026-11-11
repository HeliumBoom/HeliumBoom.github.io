import { getPosts, summarize } from "../lib/posts";
import { withBase } from "../lib/urls";
export async function GET() {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts.map(post => ({ ...summarize(post), url: withBase(`/posts/${post.id}/`), content: post.body || "" }))), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
