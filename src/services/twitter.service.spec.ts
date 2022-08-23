import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService, TwitterService } from './';
import { AccountUpdateProfile, AccountUpdateProfileBannerParams, AccountUpdateProfileParams, FollowersList, FollowersListParams, TwitterClient, UsersShow, UsersShowParams } from 'twitter-api-client';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

describe('TwitterService', () => {
  let twitterService: TwitterService;
  let twitterClient: TwitterClient;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              API_KEY: 'API_KEY_VALUE',
              API_SECRET: 'API_SECRET_VALUE',
              ACCESS_TOKEN: 'ACCESS_TOKEN_VALUE',
              ACCESS_SECRET: 'ACCESS_SECRET_VALUE',
              SCREEN_NAME: 'SCREEN_NAME_VALUE',
            }),
          ],
        }),
        HttpModule,
      ],
      providers: [
        AppConfigService,
        {
          provide: TwitterClient,
          useFactory: (appConfigService: AppConfigService) => {
            return new TwitterClient({
              apiKey: appConfigService.apiKey,
              apiSecret: appConfigService.apiSecret,
              accessToken: appConfigService.accessToken,
              accessTokenSecret: appConfigService.accessSecret,
            });
          },
          inject: [AppConfigService],
        },
        {
          provide: 'SCREEN_NAME',
          useFactory: (appConfigService: AppConfigService) => {
            return appConfigService.screenName;
          },
          inject: [AppConfigService],
        },
        TwitterService,
      ],
    }).compile();

    twitterService = module.get<TwitterService>(TwitterService);
    twitterClient = module.get<TwitterClient>(TwitterClient);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(twitterService).toBeDefined();
  });

  describe('screenName', () => {
    it('should be defined', () => {
      expect(twitterService.screenName).toBeDefined();
    });

    it('should be SCREEN_NAME_VALUE', () => {
      expect(twitterService.screenName).toEqual('SCREEN_NAME_VALUE');
    });
  });

  describe('getFollowerCount', () => {
    it('should be defined', () => {
      expect(twitterService.getFollowerCount).toBeDefined();
    });

    it('should return 514 followers', async () => {
      const usersShowMock = jest.spyOn(twitterClient.accountsAndUsers, 'usersShow').mockImplementation((
        _parameters?: UsersShowParams
      ) => {
        return Promise.resolve({
          followers_count: 514
        } as UsersShow);
      });
      const returnedValue = await twitterService.getFollowerCount();
      expect(usersShowMock).toBeCalledWith(
        {
          screen_name: 'SCREEN_NAME_VALUE',
          include_entities: false,
        }
      );
      expect(returnedValue).toEqual(514);
    });
  });

  describe('updateLocation', () => {
    it('should be defined', () => {
      expect(twitterService.updateLocation).toBeDefined();
    });

    it('should call accountUpdateProfile', async () => {
      const accountUpdateProfileMock = jest.spyOn(twitterClient.accountsAndUsers, 'accountUpdateProfile').mockImplementation((
        _parameters?: AccountUpdateProfileParams
      ) => {
        return Promise.resolve({ } as AccountUpdateProfile);
      });
      await twitterService.updateLocation(
        'NEW_LOCATION'
      );
      expect(accountUpdateProfileMock).toBeCalledWith(
        { location: 'NEW_LOCATION' }
      );
    });
  });

  describe('getFollowersProfileImageBuffers', () => {
    it('should be defined', () => {
      expect(twitterService.getFollowersProfileImageBuffers).toBeDefined();
    });

    it('should call without errors', async () => {
      const followersListMock = jest.spyOn(twitterClient.accountsAndUsers, 'followersList').mockImplementation((
        _parameters?: FollowersListParams
      ) => {
        return Promise.resolve({ 
          users: [
            {
              profile_image_url_https: 'FIRST_URL'
            },
            {
              profile_image_url_https: 'SECOND_URL'
            }
          ]
        } as FollowersList);
      });

      const getMock = jest.spyOn(httpService, 'get').mockImplementation((
        _url: string,
        _config?: AxiosRequestConfig
      ) => {
        return new Observable((subscriber) => {
          subscriber.next(
            {
              data: Buffer.alloc(5)
            } as AxiosResponse
          );
          subscriber.complete();
        });
      });

      const returnedValue = await twitterService.getFollowersProfileImageBuffers();

      expect(followersListMock).toBeCalledWith(
        { count: 3 }
      );
      expect(getMock).toHaveBeenNthCalledWith(
        1,
        'FIRST_URL',
        {
          responseType: 'arraybuffer',
        }
      );
      expect(getMock).toHaveBeenNthCalledWith(
        2,
        'SECOND_URL',
        {
          responseType: 'arraybuffer',
        }
      );
      expect(returnedValue).toEqual([
        Buffer.alloc(5),
        Buffer.alloc(5)
      ])
    });
  });

  describe('updateBanner', () => {
    it('should be defined', () => {
      expect(twitterService.updateBanner).toBeDefined();
    });

    it('should call accountUpdateProfileBanner', async () => {
      const accountUpdateProfileBannerMock = jest.spyOn(twitterClient.accountsAndUsers, 'accountUpdateProfileBanner').mockImplementation((
        _parameters?: AccountUpdateProfileBannerParams
      ) => {
        return Promise.resolve({ } as unknown);
      });

      const bannerBufferMock = Buffer.alloc(5);
      await twitterService.updateBanner(
        bannerBufferMock
      );
      expect(accountUpdateProfileBannerMock).toBeCalledWith(
        { banner: bannerBufferMock.toString('base64') }
      );
    });
  });
});
