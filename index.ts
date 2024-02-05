type Links<T = unknown> = Record<
  string,
  & {
    link: string
    name: string
    featuredApp?: number
    featuredBrowser?: number
  }
  & T
>

const links = JSON.parse(await Deno.readTextFile('./links.json')) as Links

const newLinks: Links = {}
const deadLinks: Links<{ cause: unknown }> = {}

for (const [key, { link, ...rest }] of Object.entries(links)) {
  try {
    const res = await fetch(link, {
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })
    console.log(`${key}: status ${res.status}`)

    if (res.status === 404) {
      deadLinks[key] = { link, cause: 'not found', ...rest }
      continue
    }

    newLinks[key] = { link, ...rest }
  } catch (err) {
    console.log(key, err)
    deadLinks[key] = { link, cause: (err as Error).message, ...rest }
  }
}

await Deno.writeTextFile(
  './dead-links.json',
  JSON.stringify(deadLinks, null, 2),
)
await Deno.writeTextFile('./links.json', JSON.stringify(newLinks, null, 2))
