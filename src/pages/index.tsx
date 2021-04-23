// SPA -> Single Page Application   -- not indexed
// SSR -> Server Side Rendering     -- will be executed on every access
// SSG -> Static Site Generation    -- generate a static html version, load faster

import { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US";

import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from "./home.module.scss";

type Episode = {
	id: string;
	title: string;
	members: string;
	thumbnail: string;
	url: string;
	duration: number;
	durationAsString: string;
	publishedAt: string;
};

type HomeProps = {
	latestEpisodes: Episode[]; // or Array<Episode>
	allEpisodes: Episode[];
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
	// SPA
	// useEffect(() => {
	//   fetch('http://localhost:3333/episodes')
	//     .then(response => response.json())
	//     .then(data => console.log(data))
	// }, [])

	return (
		<div className={styles.homepage}>
			<section className={styles.latestEpisodes}>
				<h2>Latest episodes</h2>

				<ul>
					{latestEpisodes.map(episode => {
						return (
							<li key={episode.id}>
								<Image
									width={192}
									height={192}
                  objectFit="cover"
									src={episode.thumbnail}
									alt={episode.title}
								/>

								<div className={styles.episodeDetails}>
									<Link href={`/episodes/${episode.id}`}>
										<a>{episode.title}</a>
									</Link>
									<p>{episode.members}</p>
									<span>{episode.publishedAt}</span>
									<span>{episode.durationAsString}</span>
								</div>

								<button type="button">
									<img src="/play-green.svg" alt="Play episode" />
								</button>
							</li>
						);
					})}
				</ul>
			</section>

			<section className={styles.allEpisodes}>
        <h2>All episodes</h2>

        <table cellSpacing={0}>
          <thead>
						<tr>
							<th></th>
							<th>Podcast</th>
							<th>Featuring</th>
							<th>Date</th>
							<th>Duration</th>
							<th></th>
						</tr>
          </thead>
          <tbody>
            {allEpisodes.map(episode => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image 
                      width={120}
                      height={120}
                      objectFit="cover"
                      src={episode.thumbnail}
                      alt={episode.title}
                    />
                  </td>
                  <td>
										<Link href={`/episodes/${episode.id}`}>
                    	<a>{episode.title}</a>
										</Link>
				          </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="/play-green.svg" alt="Play episode" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
		</div>
	);
}

// SSR -> export async function getServerSideProps() { ... }
// SSG
export const getStaticProps: GetStaticProps = async () => {
	// const response = await fetch('http://localhost:3333/episodes?_limit=12&_sort=publised_at&_order=desc')
	const { data } = await api.get('episodes', {
		params: {
			_limit: 12,
			_sort: "published_at",
			_order: "desc"
		},
	});

	const episodes = data.map(episode => {
		return {
			id: episode.id,
			title: episode.title,
			members: episode.members,
			thumbnail: episode.thumbnail,
			url: episode.file.url,
			duration: Number(episode.file.duration),
			publishedAt: format(parseISO(episode.published_at), "EEE MMM yy", {
				locale: enUS,
			}),
			durationAsString: convertDurationToTimeString(
				Number(episode.file.duration)
			),
		};
	});

	const latestEpisodes = episodes.slice(0, 2);
	const allEpisodes = episodes.slice(2, episodes.length);

	return {
		props: {
			// always return props obj
			latestEpisodes,
			allEpisodes,
		},
		revalidate: 60 * 60 * 8, // every 8 hours
	};
};
