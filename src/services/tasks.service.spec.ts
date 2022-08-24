import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import {
  AppConfigService,
  TwitterService,
  ProgressService,
  BannerService,
  TasksService,
} from './';
import { HttpModule } from '@nestjs/axios';

describe('TasksService', () => {
  let service: TasksService;
  let twitterService: TwitterService;
  let progressService: ProgressService;
  let bannerService: BannerService;

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
        ScheduleModule.forRoot(),
        HttpModule,
      ],
      providers: [
        AppConfigService,
        {
          provide: 'SCREEN_NAME',
          useFactory: (appConfigService: AppConfigService) => {
            return appConfigService.screenName;
          },
          inject: [AppConfigService],
        },
        {
          provide: TwitterService,
          useValue: {
            getFollowerCount: jest.fn(),
            updateLocation: jest.fn(),
            getFollowersProfileImageBuffers: jest.fn(),
            updateBanner: jest.fn(),
          },
        },
        ProgressService,
        BannerService,
        TasksService,
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    twitterService = module.get<TwitterService>(TwitterService);
    progressService = module.get<ProgressService>(ProgressService);
    bannerService = module.get<BannerService>(BannerService);

    module.useLogger(false);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLocation', () => {
    it('should be defined', () => {
      expect(service.updateProfile).toBeDefined();
    });

    it('should run correctly', async () => {
      const getFollowerCountMock = jest
        .spyOn(twitterService, 'getFollowerCount')
        .mockResolvedValue(1);
      const getProgressMock = jest
        .spyOn(progressService, 'getProgress')
        .mockReturnValue('FAKE_VALUE');
      const updateLocationMock = jest.spyOn(twitterService, 'updateLocation');

      const getBannerBufferFromFileMock = jest
        .spyOn(bannerService, 'getBannerBufferFromFile')
        .mockResolvedValue(Buffer.alloc(5));
      const getFollowersProfileImageBuffersMock = jest
        .spyOn(twitterService, 'getFollowersProfileImageBuffers')
        .mockResolvedValue([Buffer.alloc(5), Buffer.alloc(5)]);
      const generatedBannerMock = jest
        .spyOn(bannerService, 'generateBanner')
        .mockResolvedValue(Buffer.alloc(10));
      const updateBannerMock = jest.spyOn(twitterService, 'updateBanner');

      await service.updateProfile();

      expect(getFollowerCountMock).toBeCalled();
      expect(getProgressMock).toBeCalledWith(1);
      expect(updateLocationMock).toBeCalledWith('FAKE_VALUE');

      expect(getBannerBufferFromFileMock).toBeCalled();
      expect(getFollowersProfileImageBuffersMock).toBeCalled();
      expect(generatedBannerMock).toBeCalledWith(Buffer.alloc(5), [
        Buffer.alloc(5),
        Buffer.alloc(5),
      ]);
      expect(updateBannerMock).toBeCalledWith(Buffer.alloc(10));
    });
  });
});
