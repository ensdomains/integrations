
type Links<T = unknown> = Record<
string,
{ link: string; name: string } & T
>


const links = JSON.parse(await Deno.readTextFile('./links.json')) as Links

const newLinks: Links = {}
const deadLinks: Links<{cause: unknown}> = {}

for (const [key, { name, link }] of Object.entries(links)) {
  try {
    const res = await fetch(link, { signal: AbortSignal.timeout(10_000),cache:'no-store' })
    console.log(`${key}: status ${res.status}`)

    newLinks[key] = { name, link }
  } catch (err) {
    console.log(key, err)
    deadLinks[key] = { name, link, cause: (err as Error).message }
  } 
}


await Deno.writeTextFile('./dead-links.json', JSON.stringify(deadLinks, null, 2))
await Deno.writeTextFile('./links.json', JSON.stringify(newLinks, null, 2))