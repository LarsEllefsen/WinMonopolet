import { env } from '$env/dynamic/private';
import { Releases, ReleasesDTO } from '../../../types/releases';
import { APIError } from '../APIError';
import { GET } from '../GET';

export const getReleases = async (): Promise<Releases> => {
	const releasesDTO = await GET<ReleasesDTO>(`${env.API_URL}/api/releases`);
	if (releasesDTO instanceof APIError) {
		console.warn(`Failed to get releases: ${releasesDTO.message}`);
		return { previousReleases: [], upcomingReleases: [] };
	}

	return {
		upcomingReleases: releasesDTO.upcomingReleases.map((x) => new Date(x)),
		previousReleases: releasesDTO.previousReleases.map((x) => new Date(x))
	} satisfies Releases;
};
