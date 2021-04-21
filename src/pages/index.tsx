// SPA -> Single Page Application   -- not indexed 
// SSR -> Server Side Rendering     -- will be executed on every access
// SSG -> Static Site Generation    -- generate a static html version, load faster

import { useEffect } from "react"

export default function Home(props) {

  // SPA
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes')
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  // }, [])

  return (
    <div>
      <h1>Index</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </div>
  )
}

// SSR -> export async function getServerSideProps() { ... }
// SSG
export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: { // always return props obj
      episodes: data,
    },
    revalidate: 60 * 60 * 8, // every 8 hours
  }
}