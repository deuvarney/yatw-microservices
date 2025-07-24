// src/tv-shows/tv-shows.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { In, Repository, DataSource, EntityManager, DeepPartial } from 'typeorm';
import { TvShow } from './entities/tv-show.entity';
import { Genre } from './entities/genre.entity';
import { Network } from './entities/network.entity';
import { CountryDto, CreateTvShowDto, DetailedPersonDto, EpisodeDto, GenreDto, NetworkDto, PersonDto, ProductionCompanyDto, SeasonDto } from './dto/create-tv-show.dto';
import {
	Crew,
	GuestStar,
	ShowResponse,
	SpokenLanguage,
	TvSeasonResponse,
} from 'moviedb-promise';
import { Person } from './entities/person.entity';
import { ProductionCompany } from './entities/production-company.entity';
import { Season } from './entities/season.entity';
import { Episode } from './entities/episode.entity';
import { Country } from './entities/country.entity';
import { Language } from './entities/language.entity';
import { DetailedPerson } from './entities/detailed-person.entity';
import { TmdbApiService } from './tmdb-api/tmdb-api.service';
import { TrendingShows } from './entities/trending.entity';

async function promiseSleep(timout: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, timout);
	});
}

type UpdateTVSeasonResponse = TvSeasonResponse & {
	vote_average: number;
	//   episodes: Episode & { episodeNumber: number }[];
	//   episodes: TvSeasonResponse
};

type UpdatedShowResponse = ShowResponse & {
	adult: boolean;
	seasons?: UpdateTVSeasonResponse[];
};

type UpdatedSpokenLanguage = SpokenLanguage & {
	english_name: string;
};

type UpdatedDetailedPerson = GuestStar &
	Crew & {
		adult: boolean;
	};

@Injectable()
export class TvShowsService {
	constructor(

		@InjectRepository(TvShow)
		private tvShowRepository: Repository<TvShow>,
		@InjectRepository(Genre)
		private genreRepository: Repository<Genre>,
		@InjectRepository(Network)
		private networkRepository: Repository<Network>,
		@InjectRepository(Person)
		private personRepository: Repository<Person>,
		@InjectRepository(DetailedPerson)
		private detailedPersonRepository: Repository<DetailedPerson>,
		@InjectRepository(ProductionCompany)
		private prodCompanyRepository: Repository<ProductionCompany>,
		@InjectRepository(Season)
		private seasonRepository: Repository<Season>,
		@InjectRepository(Country)
		private countryRepository: Repository<Country>,
		@InjectRepository(Episode)
		private episodeRepository: Repository<Episode>,
		@InjectRepository(Language)
		private languageRepository: Repository<Language>,
		// @InjectRepository(TrendingShows)
		// private trendingRepository: Repository<TrendingShows>,

		private readonly tmdbApiService: TmdbApiService,

		@InjectDataSource()
		private dataSource: DataSource,
	) { }

	personCache: Record<string, Person> = {};
	detailedPersonCache: Record<string, DetailedPerson> = {};
	networkCache: Record<string, Network> = {};
	async create(createTvShowDto: CreateTvShowDto): Promise<TvShow> {
		// Use a transaction for data consistency
		return await this.dataSource.transaction(async manager => {
			const tvShow = this.createBaseTvShow(createTvShowDto);

			// Process all relations in parallel where possible
			await Promise.all([
				this.attachGenres(tvShow, createTvShowDto.genres, manager),
				this.attachNetworks(tvShow, createTvShowDto.networks, manager),
				this.attachCreators(tvShow, createTvShowDto.createdBy, manager),
				this.attachProductionCountries(tvShow, createTvShowDto.productionCountries, manager),
				this.attachProductionCompanies(tvShow, createTvShowDto.productionCompanies, manager),
				this.attachSpokenLanguages(tvShow, createTvShowDto.spokenLanguages, manager),
			]);

			// Seasons must be processed sequentially due to episodes dependency
			await this.attachSeasons(tvShow, createTvShowDto.seasons, manager);

			return await manager.save(TvShow, tvShow);
		});
	}

	private createBaseTvShow(dto: CreateTvShowDto): TvShow {
		const tvShow = new TvShow();

		Object.assign(tvShow, {
			id: dto.id,
			name: dto.name,
			originalName: dto.originalName,
			overview: dto.overview,
			firstAirDate: dto.firstAirDate,
			lastAirDate: dto.lastAirDate,
			status: dto.status,
			type: dto.type,
			tagline: dto.tagline,
			posterPath: dto.posterPath,
			backdropPath: dto.backdropPath,
			popularity: dto.popularity,
			voteAverage: dto.voteAverage,
			voteCount: dto.voteCount,
			inProduction: dto.inProduction,
			numberOfEpisodes: dto.numberOfEpisodes,
			numberOfSeasons: dto.numberOfSeasons,
			originalLanguage: dto.originalLanguage,
			homepage: dto.homepage,
			adult: dto.adult || false,
			episodeRunTime: dto.episodeRunTime,
			languages: dto.languages,
		});

		return tvShow;
	}

	private async attachGenres(
		tvShow: TvShow,
		genreDtos: GenreDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!genreDtos?.length) return;

		const genreRepo = manager.getRepository(Genre);
		const existingGenres = await genreRepo.find({
			where: { id: In(genreDtos.map(g => g.id)) }
		});

		const existingIds = new Set(existingGenres.map(g => g.id));
		const newGenres = genreDtos
			.filter(dto => !existingIds.has(dto.id))
			.map(dto => genreRepo.create({
				id: dto.id,
				name: dto.name
			}));

		if (newGenres.length > 0) {
			await genreRepo.save(newGenres);
		}

		tvShow.genres = [...existingGenres, ...newGenres];
	}

	private async attachNetworks(
		tvShow: TvShow,
		networkDtos: NetworkDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!networkDtos?.length) return;

		const networkRepo = manager.getRepository(Network);
		const existingNetworks = await networkRepo.find({
			where: { id: In(networkDtos.map(n => n.id)) }
		});

		const existingIds = new Set(existingNetworks.map(n => n.id));
		const newNetworks = [];

		for (const dto of networkDtos) {
			if (!existingIds.has(dto.id)) {
				const country = dto.originCountry
					? await manager.getRepository(Country).findOne({
						where: { iso31661: dto.originCountry }
					})
					: null;

				const network = networkRepo.create({
					id: dto.id,
					name: dto.name,
					logoPath: dto.logoPath,
					country: country,
				});

				newNetworks.push(network);
			}
		}

		if (newNetworks.length > 0) {
			await networkRepo.save(newNetworks);
		}

		tvShow.networks = [...existingNetworks, ...newNetworks];
	}

	private async attachCreators(
		tvShow: TvShow,
		creatorDtos: PersonDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!creatorDtos?.length) return;

		const personRepo = manager.getRepository(Person);
		const existingPeople = await personRepo.find({
			where: { id: In(creatorDtos.map(p => p.id)) }
		});

		const existingIds = new Set(existingPeople.map(p => p.id));
		const newPeople = creatorDtos
			.filter(dto => !existingIds.has(dto.id))
			.map(dto => personRepo.create({
				id: dto.id,
				name: dto.name,
				profilePath: dto.profilePath,
				knownForDepartment: dto.knownForDepartment,
				gender: dto.gender,
			}));

		if (newPeople.length > 0) {
			await personRepo.save(newPeople);
		}

		tvShow.createdBy = [...existingPeople, ...newPeople];
	}

	private async attachProductionCountries(
		tvShow: TvShow,
		countryDtos: CountryDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!countryDtos?.length) return;

		const countryRepo = manager.getRepository(Country);
		const existingCountries = await countryRepo.find({
			where: { iso31661: In(countryDtos.map(c => c.iso_3166_1)) }
		});

		const existingIsoCodes = new Set(existingCountries.map(c => c.iso31661));
		const newCountries = countryDtos
			.filter(dto => !existingIsoCodes.has(dto.iso_3166_1))
			.map(dto => countryRepo.create({
				iso31661: dto.iso_3166_1,
				name: dto.name,
			}));

		if (newCountries.length > 0) {
			await countryRepo.save(newCountries);
		}

		tvShow.productionCountries = [...existingCountries, ...newCountries];
	}

	private async attachProductionCompanies(
		tvShow: TvShow,
		companyDtos: ProductionCompanyDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!companyDtos?.length) return;

		const companyRepo = manager.getRepository(ProductionCompany);
		const existingCompanies = await companyRepo.find({
			where: { id: In(companyDtos.map(c => c.id)) }
		});

		const existingIds = new Set(existingCompanies.map(c => c.id));
		const newCompanies = [];

		for (const dto of companyDtos) {
			if (!existingIds.has(dto.id)) {
				const country = dto.originCountry
					? await manager.getRepository(Country).findOne({
						where: { iso31661: dto.originCountry }
					})
					: null;

				const company = companyRepo.create({
					id: dto.id,
					name: dto.name,
					logoPath: dto.logoPath,
					originCountry: country,
				});

				newCompanies.push(company);
			}
		}

		if (newCompanies.length > 0) {
			await companyRepo.save(newCompanies);
		}

		tvShow.productionCompanies = [...existingCompanies, ...newCompanies];
	}

	private async attachSpokenLanguages(
		tvShow: TvShow,
		languageDtos: Language[] | undefined, // Using Language entity as per your DTO
		manager: EntityManager
	): Promise<void> {
		if (!languageDtos?.length) return;

		const languageRepo = manager.getRepository(Language);
		const existingLanguages = await languageRepo.find({
			where: { iso_639_1: In(languageDtos.map(l => l.iso_639_1)) }
		});

		const existingIsoCodes = new Set(existingLanguages.map(l => l.iso_639_1));
		const newLanguages = languageDtos
			.filter(dto => !existingIsoCodes.has(dto.iso_639_1))
			.map(dto => languageRepo.create({
				iso_639_1: dto.iso_639_1,
				name: dto.name,
				english_name: dto.english_name,
			}));

		if (newLanguages.length > 0) {
			await languageRepo.save(newLanguages);
		}

		tvShow.spokenLanguages = [...existingLanguages, ...newLanguages];
	}

	private async attachSeasons(
		tvShow: TvShow,
		seasonDtos: SeasonDto[] | undefined,
		manager: EntityManager
	): Promise<void> {
		if (!seasonDtos?.length) return;

		const existingSeasons = await manager.getRepository(Season).find({
			where: { tvShowId: tvShow.id },
		});

		const existingSeasonsMap = new Map(
			existingSeasons.map(s => [s.seasonNumber, s])
		);

		const seasons = [];

		for (const seasonDto of seasonDtos) {
			let season = existingSeasonsMap.get(seasonDto.seasonNumber);

			if (!season) {
				season = await this.createSeason(tvShow.id, seasonDto, manager);
			}

			seasons.push(season);
		}

		tvShow.seasons = seasons;
	}

	private async createSeason(
		tvShowId: number,
		seasonDto: SeasonDto,
		manager: EntityManager
	): Promise<Season> {
		const season = manager.getRepository(Season).create({
			id: seasonDto.id,
			tvShowId,
			seasonNumber: seasonDto.seasonNumber,
			name: seasonDto.name,
			overview: seasonDto.overview,
			airDate: seasonDto.airDate,
			episodeCount: seasonDto.episodes?.length || 0,
			posterPath: seasonDto.posterPath,
			voteAverage: seasonDto.voteAverage,
		});

		await manager.save(Season, season);

		if (seasonDto.episodes?.length) {
			season.episodes = await this.createEpisodes(
				season.id,
				seasonDto.episodes,
				manager
			);
		}

		return season;
	}

	private async createEpisodes(
		seasonId: number,
		episodeDtos: EpisodeDto[],
		manager: EntityManager
	): Promise<Episode[]> {
		const existingEpisodes = await manager.getRepository(Episode).find({
			where: { id: In(episodeDtos.map(e => e.id)) },
		});

		const existingEpisodeIds = new Set(existingEpisodes.map(e => e.id));
		const missingEpisodes = episodeDtos.filter(e => !existingEpisodeIds.has(e.id));

		const newEpisodes = [];

		for (const episodeDto of missingEpisodes) {
			const episode = await this.createEpisode(seasonId, episodeDto, manager);
			newEpisodes.push(episode);
		}

		return [...existingEpisodes, ...newEpisodes];
	}

	private async createEpisode(
		seasonId: number,
		episodeDto: EpisodeDto,
		manager: EntityManager
	): Promise<Episode> {
		const episode = manager.getRepository(Episode).create({
			id: episodeDto.id,
			seasonId, // Using the number passed in, not the DTO's string seasonId
			airDate: episodeDto.airDate,
			episodeNumber: episodeDto.episodeNumber,
			episodeType: episodeDto.episodeType,
			name: episodeDto.name,
			overview: episodeDto.overview,
			productionCode: episodeDto.productionCode,
			runtime: episodeDto.runtime,
			showId: episodeDto.showId,
			stillPath: episodeDto.stillPath,
			voteAverage: episodeDto.voteAverage,
			voteCount: episodeDto.voteCount,
		});

		// Process crew and guest stars
		// const [crew, guestStars] = await Promise.all([
		// 	this.findOrCreateDetailedPeople(episodeDto.crew || [], manager),
		// 	this.findOrCreateDetailedPeople(episodeDto.guestStars || [], manager),
		// ]);
		const crew = await this.findOrCreateDetailedPeople(episodeDto.crew || [], manager);
		const guestStars = await this.findOrCreateDetailedPeople(episodeDto.guestStars || [], manager);

		episode.crew = crew;
		episode.guestStars = guestStars;

		return await manager.save(Episode, episode);
	}

	private async findOrCreateDetailedPeople(
		peopleDtos: DetailedPersonDto[],
		manager: EntityManager
	): Promise<DetailedPerson[]> {
		if (!peopleDtos.length) return [];

		const repository = manager.getRepository(DetailedPerson);
		const existingPeople = await repository.find({
			where: { id: In(peopleDtos.map(p => p.id)) },
		});

		const existingPeopleMap = new Map(
			existingPeople.map(p => [p.id, p])
		);

		const uniquePeopleDtos = Array.from(new Map(peopleDtos.filter(dto => !existingPeopleMap.has(dto.id)).map(dto => [dto.id, dto])).values());

		const peopleToCreate = uniquePeopleDtos
			.map(dto => repository.create({
				id: dto.id,
				adult: dto.adult,
				creditId: dto.creditId,
				department: dto.department,
				gender: dto.gender,
				job: dto.job,
				knownForDepartment: dto.knownForDepartment,
				name: dto.name,
				originalName: dto.originalName,
				profilePath: dto.profilePath,
				// Note: popularity might need to be handled differently if your entity doesn't have this field
			}));

		if (peopleToCreate.length > 0) {
			await manager.save(DetailedPerson, peopleToCreate);
		}

		return [...existingPeople, ...peopleToCreate];
	}

	// Generic helper for finding or creating entities
	private async findOrCreateEntities<T extends { [key: string]: any }, D>(
		dtos: D[],
		repository: Repository<T>,
		createData: (dto: D) => DeepPartial<T>,
		idField: keyof T,
		getId?: (dto: D) => any
	): Promise<T[]> {
		if (!dtos?.length) return [];

		const ids = dtos.map(dto => getId ? getId(dto) : (dto as any).id);
		const existing = await repository.find({
			where: { [idField]: In(ids) } as any,
		});

		const existingMap = new Map(
			existing.map(e => [(e as any)[idField], e])
		);

		const toCreate = dtos
			.filter(dto => {
				const id = getId ? getId(dto) : (dto as any).id;
				return !existingMap.has(id);
			})
			.map(dto => repository.create(createData(dto)));

		if (toCreate.length > 0) {
			await repository.save(toCreate);
		}

		return [...existing, ...toCreate];
	}


	async findOneTvShow(id: number): Promise<TvShow> {
		const tvShow = await this.tvShowRepository.findOne({
			where: { id },
			relations: [
				'createdBy',
				'genres',
				'networks',
				'productionCompanies',
				'productionCompanies.originCountry',
				'productionCountries',
				'originCountry',
				'seasons',
				'spokenLanguages',
			],
		});

		return tvShow;
	}

	async findDetailedSeason(
		tvShowId: number,
		seasonNumber: number,
	): Promise<Season> {
		console.log('hitting season', tvShowId, seasonNumber);
		const season = await this.seasonRepository.findOne({
			where: { tvShowId, seasonNumber },
			relations: ['episodes', 'episodes.crew', 'episodes.guestStars'],
		});

		return season;
	}

	async importFromExternalApi(apiData: UpdatedShowResponse): Promise<TvShow> {
		// Transform API data to your DTO
		const createTvShowDto = new CreateTvShowDto();

		// Map base properties
		createTvShowDto.id = apiData.id;
		createTvShowDto.name = apiData.name;
		createTvShowDto.originalName = apiData.original_name;
		createTvShowDto.overview = apiData.overview;
		createTvShowDto.firstAirDate = apiData.first_air_date
			? new Date(apiData.first_air_date)
			: null;
		createTvShowDto.lastAirDate = apiData.last_air_date
			? new Date(apiData.last_air_date)
			: null;
		createTvShowDto.status = apiData.status;
		createTvShowDto.type = apiData.type;
		createTvShowDto.tagline = apiData.tagline;
		createTvShowDto.posterPath = apiData.poster_path;
		createTvShowDto.backdropPath = apiData.backdrop_path;
		createTvShowDto.popularity = apiData.popularity;
		createTvShowDto.voteAverage = apiData.vote_average;
		createTvShowDto.voteCount = apiData.vote_count;
		createTvShowDto.inProduction = apiData.in_production;
		createTvShowDto.numberOfEpisodes = apiData.number_of_episodes;
		createTvShowDto.numberOfSeasons = apiData.number_of_seasons;
		createTvShowDto.originalLanguage = apiData.original_language;
		createTvShowDto.homepage = apiData.homepage;
		createTvShowDto.adult = apiData.adult || false;
		createTvShowDto.episodeRunTime = apiData.episode_run_time;
		createTvShowDto.languages = apiData.languages;

		// Map genres
		if (apiData.genres?.length) {
			createTvShowDto.genres = apiData.genres.map((g) => ({
				id: g.id,
				name: g.name,
			}));
		}

		// Map networks
		if (apiData.networks?.length) {
			createTvShowDto.networks = apiData.networks.map((n) => ({
				id: n.id,
				name: n.name,
				logoPath: n.logo_path,
				originCountry: n.origin_country,
			}));
		}

		// Map createdBy
		if (apiData.created_by && apiData.created_by.length) {
			createTvShowDto.createdBy = apiData.created_by.map((c) => ({
				id: c.id,
				name: c.name,
				profilePath: c.profile_path,
				// knownForDepartment: c.known_for_department,
			}));
		}

		if (apiData.production_countries?.length) {
			createTvShowDto.productionCountries = apiData.production_countries.map(
				(c) => ({
					iso_3166_1: c.iso_3166_1,
					name: c.name,
				}),
			);
		}

		if (apiData.origin_country?.length) {
			createTvShowDto.originCountry = apiData.origin_country.map((c) =>
				createTvShowDto.productionCountries.find((pc) => pc.iso_3166_1 === c),
			);
		}

		// Map Production Companies
		if (apiData.production_companies && apiData.production_companies.length) {
			createTvShowDto.productionCompanies = apiData.production_companies.map(
				(c) => ({
					id: c.id,
					name: c.name,
					logoPath: c.logo_path,
					originCountry: c.origin_country,
				}),
			);
		}

		// Map Seasons/Episodes
		if (apiData.seasons?.length) {
			createTvShowDto.seasons = apiData.seasons.map(
				(s: UpdateTVSeasonResponse) => ({
					id: s.id,
					seasonNumber: s.season_number,
					name: s.name,
					overview: s.overview,
					airDate: s.air_date ? new Date(s.air_date) : null,
					posterPath: s.poster_path,
					voteAverage: s.vote_average,
					episodes: s.episodes.map((e) => ({
						// ...e,
						id: e.id,
						airDate: e.air_date ? new Date(e.air_date) : null,
						crew: e.crew.map((c) => ({
							...c,
							adult: c.adult || false,
							id: c.id || 0,
							creditId: c.credit_id,
							department: c.department,
							gender: c.gender,
							job: c.job,
							knownForDepartment: c.known_for_department,
							name: c.name || '',
							originalName: c.original_name,
							popularity: c.popularity,
							profilePath: c.profile_path,
						})), // TODO: // update with actual ppl entity
						episodeNumber: e.episode_number,
						// @ts-expect-error Epsidoe_type needs to be added to types
						episodeType: e.episode_type,
						guestStars: e.guest_stars.map((c: UpdatedDetailedPerson) => ({
							...c,
							adult: c.adult || false,
							id: c.id || 0,
							creditId: c.credit_id,
							department: c.department,
							gender: c.gender,
							job: c.job,
							knownForDepartment: c.known_for_department,
							name: c.name || '',
							originalName: c.original_name,
							popularity: c.popularity,
							profilePath: c.profile_path,
						})), // TODO: // update with actual ppl entity, // TODO:  // update with actual ppl entity
						name: e.name,
						overview: e.overview,
						productionCode: e.production_code,
						runtime: e.runtime,
						seasonNumber: s.season_number,
						// @ts-expect-error Epsidoe_type needs to be added to types
						showId: e.show_id,
						stillPath: e.still_path,
						voteAverage: e.vote_average,
						voteCount: e.vote_count,

						// tvShowId: apiData.id, // TODO: work on getting this removed
						seasonId: s.id,
					})),
				}),
			);
		}

		if (apiData.spoken_languages) {
			createTvShowDto.spokenLanguages = apiData.spoken_languages.map(
				(l: UpdatedSpokenLanguage) => ({
					...l,
					english_name: l.english_name || '',
					iso_639_1: l.iso_639_1 || '',
					name: l.name || '',
				}),
			);
		}

		// Create TV show with our DTO
		return this.create(createTvShowDto);
	}

	async findAll(page: number): Promise<{
		results: TvShow[];
		page: number;
		total_pages: number;
		total_results: number;
	}> {
		const take = 20;
		const count = await this.tvShowRepository.count();
		const totalPages = Math.ceil(count / take);

		const results = await this.tvShowRepository.find({
			relations: [
				'genres',
				//   'networks',
				//   'seasons',
				//   'productionCompanies',
				//   'productionCompanies.originCountry',
				//   'productionCountries',
				'originCountry',
			],
			take,
			skip: (page - 1) * take, // 20 items per page, page 1 = skip
		});

		return {
			results,
			page,
			total_pages: totalPages,
			total_results: count,
		};
	}

	async update(
		id: number,
		updateTvShowDto: Partial<CreateTvShowDto>,
	): Promise<TvShow> {
		// First check if exists
		const tvShow = await this.findOneTvShow(id);

		// Update basic properties
		if (updateTvShowDto.name) tvShow.name = updateTvShowDto.name;
		if (updateTvShowDto.originalName)
			tvShow.originalName = updateTvShowDto.originalName;
		if (updateTvShowDto.overview) tvShow.overview = updateTvShowDto.overview;
		if (updateTvShowDto.firstAirDate)
			tvShow.firstAirDate = updateTvShowDto.firstAirDate;

		// Handle relations if needed
		if (updateTvShowDto.genres && updateTvShowDto.genres.length) {
			const genreIds = updateTvShowDto.genres.map((g) => g.id);
			tvShow.genres = await this.genreRepository.findByIds(genreIds);
		}

		return this.tvShowRepository.save(tvShow);
	}

	async remove(id: number): Promise<void> {
		const tvShow = await this.findOneTvShow(id);
		await this.tvShowRepository.remove(tvShow);
	}

	async injectTrendingShowsPage(page = 1): Promise<void> {

		// const trendingShowPage = null;

		const showIds: number[] = (await this.tmdbApiService.getTrendingTvShows(page)).results.map(s => s.id);

		// if (false && trendingShowPage && trendingShowPage.cacheStatus === 'cached' && new Date(trendingShowPage.lastUpdatedDate).getDay() === new Date().getDay()) {
		//   shows = trendingShowPage.showsIds;
		// } else {
		//   if (trendingShowPage) {
		//     await this.trendingRepository.update(trendingShowPage.id, { page, cacheStatus: ShowCacheStatus.UPDATING, });
		//   }
		//   shows = (await this.tmdbApiService.getTrendingTvShows(page)).results.map(s => s.id);

		// }

		const existingShows = await this.tvShowRepository.find({
			where: {
				id: In(showIds)
			},
		});

		const missingShowIds = showIds.filter(id => !existingShows.find(s => s.id === id));

		for (const missingShowId of missingShowIds) {

			await promiseSleep(1000);

			// const fullShowResponse = await fetch(
			//   `https://api.themoviedb.org/3/tv/${show.id}?api_key=9b036259d38fe5e4eddd383b00877ee7`,
			// );
			const fullShowResponse = await this.tmdbApiService.getFullShowResponse(
				missingShowId,
			);
			const fullShowData: UpdatedShowResponse = fullShowResponse; //await fullShowResponse.json();

			const updatedSeasons: UpdateTVSeasonResponse[] = [];
			for (const season of fullShowData.seasons) {
				// Replace full show season data, with season call w/ episode data
				const seasonNumber = season.season_number;

				// const seasonResponse = await fetch(
				//   `https://api.themoviedb.org/3/tv/${show.id}/season/${seasonNumber}?api_key=9b036259d38fe5e4eddd383b00877ee7&season_number=${seasonNumber}`,
				// );
				const seasonData = (await this.tmdbApiService.getSeasonResponse(
					missingShowId,
					seasonNumber,
				)) as UpdateTVSeasonResponse;
				updatedSeasons.push(seasonData);
				await promiseSleep(500);
			}
			fullShowData.seasons = updatedSeasons;

			await this.importFromExternalApi(fullShowData);
			// }
		}

		// // Update last updated time if the 
		// if (trendingShowPage) {
		//   trendingShowPage.cacheStatus = ShowCacheStatus.CACHED;

		//           await this.trendingRepository.update(trendingShowPage.id, { cacheStatus: ShowCacheStatus.CACHED, });

		//   await this.trendingRepository.update(trendingShowPage);

		// } else {

		// }
	}

	async getSeason(seasonNumber: number, showId: number): Promise<Season> {
		// const seasonResponse = await fetch(
		//   `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=9b036259d38fe5e4eddd383b00877ee7&season_number=${seasonNumber}`,
		// );
		// const seasonData = await seasonResponse.json();
		const season = this.seasonRepository.findOne({
			where: { tvShowId: showId, seasonNumber: seasonNumber },
		});

		return season; // as Season;
	}
}
