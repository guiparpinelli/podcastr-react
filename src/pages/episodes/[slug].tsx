import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";

import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";

type Episode = {
	id: string;
	title: string;
	members: string;
	thumbnail: string;
	url: string;
	duration: number;
	durationAsString: string;
	publishedAt: string;
	description: string;
};

type EpisodeProps = {
	episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
	return (
		<div className={styles.episode}>
			<div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type="button">
            <img src="/arrow-left.svg" alt="Back" />
          </button>
        </Link>
				<Image
					width={700}
					height={160}
					objectFit="cover"
					src={episode.thumbnail}
				/>
				<button type="button">
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
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps = async (ctx) => {
	const { slug } = ctx.params;
	const { data } = await api.get(`/episodes/${slug}`);

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
	};

	return {
		props: {
			episode,
		},
		revalidate: 60 * 60 * 24, // 24 hours
	};
};
