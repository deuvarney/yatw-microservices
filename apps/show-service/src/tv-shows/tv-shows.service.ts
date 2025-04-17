// src/tv-shows/tv-shows.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TvShow } from './entities/tv-show.entity';
import { Genre } from './entities/genre.entity';
import { Network } from './entities/network.entity';
import { CreateTvShowDto } from './dto/create-tv-show.dto';
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

    private readonly tmdbApiService: TmdbApiService,
  ) {}

  personCache: Record<string, Person> = {};
  detailedPersonCache: Record<string, DetailedPerson> = {};
  networkCache: Record<string, Network> = {};

  async create(createTvShowDto: CreateTvShowDto): Promise<TvShow> {
    // Create a new TV show entity
    const tvShow = new TvShow();

    const baseProperties = {
      id: createTvShowDto.id,
      name: createTvShowDto.name,
      originalName: createTvShowDto.originalName,
      overview: createTvShowDto.overview,
      firstAirDate: createTvShowDto.firstAirDate,
      lastAirDate: createTvShowDto.lastAirDate,
      status: createTvShowDto.status,
      type: createTvShowDto.type,
      tagline: createTvShowDto.tagline,
      posterPath: createTvShowDto.posterPath,
      backdropPath: createTvShowDto.backdropPath,
      popularity: createTvShowDto.popularity,
      voteAverage: createTvShowDto.voteAverage,
      voteCount: createTvShowDto.voteCount,
      inProduction: createTvShowDto.inProduction,
      numberOfEpisodes: createTvShowDto.numberOfEpisodes,
      numberOfSeasons: createTvShowDto.numberOfSeasons,
      originalLanguage: createTvShowDto.originalLanguage,
      homepage: createTvShowDto.homepage,
      adult: createTvShowDto.adult || false,
      episodeRunTime: createTvShowDto.episodeRunTime,
      languages: createTvShowDto.languages,
    };

    Object.assign(tvShow, baseProperties);

    // Handle relations - find or create genres
    if (createTvShowDto.genres && createTvShowDto.genres.length) {
      const genreEntities = [];

      for (const genreDto of createTvShowDto.genres) {
        // Check if genre exists
        let genre = await this.genreRepository.findOne({
          where: { id: genreDto.id },
        });

        // If not, create it
        if (!genre) {
          genre = this.genreRepository.create({
            id: genreDto.id,
            name: genreDto.name,
          });
          await this.genreRepository.save(genre);
        }

        genreEntities.push(genre);
      }

      tvShow.genres = genreEntities;
    }

    // Handle relations - find or create networks
    if (createTvShowDto.networks && createTvShowDto.networks.length) {
      const networkEntities = [];

      for (const networkDto of createTvShowDto.networks) {
        // Check if network exists
        let network =
          this.networkCache[networkDto.id] ||
          (await this.networkRepository.findOne({
            where: { id: networkDto.id },
          }));

        // }

        // If not, create it
        if (!network) {
          // let countryEntity: Country;

          // for (const countryDto of createTvShowDto.productionCountries) {
          // Check if country exists
          const country = await this.countryRepository.findOne({
            where: { iso31661: networkDto.originCountry },
          });

          // If not, create it
          // We do not have full country details here
          //   if (!country) {
          //     country = this.countryRepository.create({
          //       iso31661: countryDto.iso_3166_1,
          //       name: countryDto.name,
          //     });
          //     await this.countryRepository.save(country);

          network = this.networkRepository.create({
            id: networkDto.id,
            name: networkDto.name,
            logoPath: networkDto.logoPath,
            // originCountry: countryEntities,
            country: country,
          });
          await this.networkRepository.save(network);
          this.networkCache[networkDto.id] = network;
        }

        networkEntities.push(network);
      }
      tvShow.networks = networkEntities;
    }

    // Handle relations - find or create people/creators
    if (createTvShowDto.createdBy && createTvShowDto.createdBy.length) {
      const personEntities = [];

      for (const personDto of createTvShowDto.createdBy) {
        // Check if person exists
        let person =
          this.personCache[personDto.id] ||
          (await this.personRepository.findOne({
            where: { id: personDto.id },
          }));

        // If not, create it
        if (!person) {
          person = this.personRepository.create({
            id: personDto.id,
            name: personDto.name,
            profilePath: personDto.profilePath,
            knownForDepartment: personDto.knownForDepartment,
            gender: personDto.gender,
          });
          await this.personRepository.save(person);

          this.personCache[personDto.id] = person;
        }

        personEntities.push(person);
      }
      tvShow.createdBy = personEntities;
    }

    // Handle relations - find or create countries
    if (createTvShowDto.productionCountries?.length) {
      const countryEntities = [];

      for (const countryDto of createTvShowDto.productionCountries) {
        // Check if country exists
        let country = await this.countryRepository.findOne({
          where: { iso31661: countryDto.iso_3166_1 },
        });

        // If not, create it
        if (!country) {
          country = this.countryRepository.create({
            iso31661: countryDto.iso_3166_1,
            name: countryDto.name,
          });
          await this.countryRepository.save(country);
        }

        countryEntities.push(country);
      }
      tvShow.productionCountries = countryEntities;
    }

    // Handle relations - find or create production companies
    if (createTvShowDto.productionCompanies?.length) {
      const prodCompanyEntities = [];

      for (const prodCompanyDto of createTvShowDto.productionCompanies) {
        // Check if production company exists
        let prodCompany = await this.prodCompanyRepository.findOne({
          where: { id: prodCompanyDto.id },
        });

        const prodCompanyCountry = await this.countryRepository.findOne({
          where: { iso31661: prodCompanyDto.originCountry },
        });

        // If not, create it
        if (!prodCompany) {
          prodCompany = this.prodCompanyRepository.create({
            id: prodCompanyDto.id,
            name: prodCompanyDto.name,
            logoPath: prodCompanyDto.logoPath,
            // originCountry: prodCompanyDto.originCountry,
            originCountry: prodCompanyCountry,
          });
          await this.prodCompanyRepository.save(prodCompany);
        }

        prodCompanyEntities.push(prodCompany);
      }
      tvShow.productionCompanies = prodCompanyEntities;
    }

    // Handle relations - find or create Seasons
    if (createTvShowDto.seasons?.length) {
      const seasonEntities = [];

      for (const seasonDto of createTvShowDto.seasons) {
        let season = await this.seasonRepository.findOne({
          where: {
            tvShowId: createTvShowDto.id,
            // tvShow: { id: createTvShowDto.id },
            seasonNumber: seasonDto.seasonNumber,
          },
        });

        // If not, create it
        if (!season) {
          season = this.seasonRepository.create({
            ...season,
            id: seasonDto.id,
            tvShowId: createTvShowDto.id,
            seasonNumber: seasonDto.seasonNumber,
            name: seasonDto.name,
            overview: seasonDto.overview,
            airDate: seasonDto.airDate,
            episodeCount: seasonDto.episodes?.length || 0,
            posterPath: seasonDto.posterPath,
            voteAverage: seasonDto.voteAverage,
          });
          await this.seasonRepository.save(season);
        }
        seasonEntities.push(season);

        const episodeEntities = [];

        for (const episodeDto of seasonDto.episodes) {
          let episode = await this.episodeRepository.findOne({
            where: {
              id: episodeDto.id,
            },
          });

          // If not, create it
          if (!episode) {
            episode = this.episodeRepository.create({
              ...episodeDto,
              id: episodeDto.id,
              airDate: episodeDto.airDate,
              crew: episodeDto.crew,
              episodeNumber: episodeDto.episodeNumber,
              episodeType: episodeDto.episodeType,
              guestStars: episodeDto.guestStars,
              name: episodeDto.name,
              overview: episodeDto.overview,
              productionCode: episodeDto.productionCode,
              runtime: episodeDto.runtime,
              showId: episodeDto.showId,
              stillPath: episodeDto.stillPath,
              voteAverage: episodeDto.voteAverage,
              voteCount: episodeDto.voteCount,

              seasonId: season.id,
              // tvShowId: createTvShowDto.id,
            });

            const crewEntities = [];
            const crewIds = new Set(); // Track IDs to avoid duplicates

            for (const crewDto of episodeDto.crew) {
              if (crewIds.has(crewDto.id)) continue;
              crewIds.add(crewDto.id);

              let crew =
                this.detailedPersonCache[crewDto.id] ||
                (await this.detailedPersonRepository.findOne({
                  where: { id: crewDto.id },
                }));

              if (!crew) {
                crew = this.detailedPersonRepository.create({
                  id: crewDto.id,
                  adult: crewDto.adult,
                  creditId: crewDto.creditId,
                  department: crewDto.department,
                  gender: crewDto.gender,
                  job: crewDto.job,
                  knownForDepartment: crewDto.knownForDepartment,
                  name: crewDto.name,
                  originalName: crewDto.originalName,
                  profilePath: crewDto.profilePath,
                });
                await this.detailedPersonRepository.save(crew);
                this.detailedPersonCache[crewDto.id] = crew;
              }
              crewEntities.push(crew);
            }
            episode.crew = crewEntities;

            const guestStarsEntities = [];
            const guestStarIds = new Set(); // Track IDs to avoid duplicates

            for (const guestStarDto of episodeDto.guestStars) {
              if (guestStarIds.has(guestStarDto.id)) continue;
              guestStarIds.add(guestStarDto.id);

              let guestStar =
                this.detailedPersonCache[guestStarDto.id] ||
                (await this.detailedPersonRepository.findOne({
                  where: { id: guestStarDto.id },
                }));

              if (!guestStar) {
                guestStar = this.detailedPersonRepository.create({
                  id: guestStarDto.id,
                  adult: guestStarDto.adult,
                  creditId: guestStarDto.creditId,
                  department: guestStarDto.department,
                  gender: guestStarDto.gender,
                  job: guestStarDto.job,
                  knownForDepartment: guestStarDto.knownForDepartment,
                  name: guestStarDto.name,
                  originalName: guestStarDto.originalName,
                  profilePath: guestStarDto.profilePath,
                });
                await this.detailedPersonRepository.save(guestStar);
                this.detailedPersonCache[guestStarDto.id] = guestStar;
              }
              guestStarsEntities.push(guestStar);
            }
            episode.guestStars = guestStarsEntities;

            await this.episodeRepository.save(episode);
          }
          episodeEntities.push(episode);
        }

        season.episodes = episodeEntities;
      }
      tvShow.seasons = seasonEntities;
    }

    if (createTvShowDto.spokenLanguages?.length) {
      const languageEntities = [];

      for (const languageDto of createTvShowDto.spokenLanguages) {
        let language = await this.languageRepository.findOne({
          where: { iso_639_1: languageDto.iso_639_1 },
        });

        // If not, create it
        if (!language) {
          language = this.languageRepository.create({
            iso_639_1: languageDto.iso_639_1,
            name: languageDto.name,
            english_name: languageDto.english_name,
          });
          await this.languageRepository.save(language);
        }
        languageEntities.push(language);
      }

      tvShow.spokenLanguages = languageEntities;
    }

    // Save the entity
    return this.tvShowRepository.save(tvShow);
  }

  async findOne(id: number): Promise<TvShow> {
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
    const tvShow = await this.findOne(id);

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
    const tvShow = await this.findOne(id);
    await this.tvShowRepository.remove(tvShow);
  }

  async injectShow(page = 1): Promise<void> {
    // const showsResponse = await fetch(
    //   `https://api.themoviedb.org/3/trending/tv/day?api_key=9b036259d38fe5e4eddd383b00877ee7&page=${page}&media_type=tv&time_window=day&languagxe=en-US`,
    // );
    // const showsData = await showsResponse.json();
    const showsData = await this.tmdbApiService.getTrendingTvShows(page);

    for (const show of showsData.results) {
      let existingShow;
      const start = Date.now();
      try {
        existingShow = await this.findOne(show.id); // TODO: Change into exist
      } catch (e) {
        if (e instanceof NotFoundException) {
          existingShow = null;
        } else {
          throw e;
        }
      } finally {
        console.log(
          '######DB Episode lookup for show',
          show.id,
          Date.now() - start,
        );
      }
      if (!existingShow) {
        await promiseSleep(1000);

        // const fullShowResponse = await fetch(
        //   `https://api.themoviedb.org/3/tv/${show.id}?api_key=9b036259d38fe5e4eddd383b00877ee7`,
        // );
        const fullShowResponse = await this.tmdbApiService.getFullShowResponse(
          show.id,
        );
        const fullShowData: UpdatedShowResponse = await fullShowResponse.json();

        const updatedSeasons: UpdateTVSeasonResponse[] = [];
        for (const season of fullShowData.seasons) {
          // Replace full show season data, with season call w/ episode data
          const seasonNumber = season.season_number;

          // const seasonResponse = await fetch(
          //   `https://api.themoviedb.org/3/tv/${show.id}/season/${seasonNumber}?api_key=9b036259d38fe5e4eddd383b00877ee7&season_number=${seasonNumber}`,
          // );
          const seasonData = (await this.tmdbApiService.getSeasonResponse(
            show.id,
            seasonNumber,
          )) as UpdateTVSeasonResponse;
          // const seasonData =
          //   (await seasonResponse.json()) as UpdateTVSeasonResponse;
          updatedSeasons.push(seasonData);
          await promiseSleep(500);
        }
        fullShowData.seasons = updatedSeasons;

        await this.importFromExternalApi(fullShowData);
      }
    }
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
