import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { GetStaticPaths, GetStaticProps } from "next"
import { format, parseISO } from "date-fns"
import enUS from "date-fns/locale/en-US"

import { api } from "../../services/api"
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString"

import styles from "./episode.module.scss"
import { usePlayer } from "../../contexts/PlayerContext"

type Episode = {
  id: string
  title: string
  members: string
  thumbnail: string
  url: string
  duration: number
  durationAsString: string
  publishedAt: string
  description: string
}

type EpisodeProps = {
  episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer()

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Back" />
          </button>
        </Link>
        <Image width={700} height={160} objectFit="cover" src={episode.thumbnail} />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Play episode" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // get latest releases
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  })
  // generate static site dynamically
  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    }
  })

  return {
    paths,
    fallback: "blocking", // incremental static regeneration
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    thumbnail: data.thumbnail,
    description: data.description,
    url: data.file.url,
    duration: Number(data.file.duration),
    publishedAt: format(parseISO(data.published_at), "EEE MMM yy", {
      locale: enUS,
    }),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}
