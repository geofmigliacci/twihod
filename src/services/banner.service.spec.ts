import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { BannerFileNotFoundError } from '../errors';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('sharp');

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerService],
    }).compile();

    service = module.get<BannerService>(BannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('composeProfile', () => {
    it('should be defined', () => {
      expect(service.composeProfile).toBeDefined();
    });

    it('should run correctly', async () => {
      const toBuffer = jest.fn();
      const png = jest.fn(() => ({ toBuffer }));
      const composite = jest.fn(() => ({ png }));
      const resize = jest.fn(() => ({ composite }));
      (sharp as any).mockImplementation(() => ({ resize }));

      await service.composeProfile(Buffer.alloc(5));

      expect(resize).toBeCalledWith(100, 100);
      expect(composite).toBeCalledWith(
        [
          {
            input: expect.any(Buffer),
            blend: 'dest-in',
          },
        ]
      );
    });
  });

  describe('getBannerBufferFromFile', () => {
    it('should be defined', () => {
      expect(service.getBannerBufferFromFile).toBeDefined();
    });

    it('should throw BannerFileNotFoundError', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(
        false
      );
      jest.spyOn(path, 'join').mockReturnValue(
        'example/banner/twitter-banner.png'
      );
      
      expect(async () => {
        await service.getBannerBufferFromFile()
      }).rejects.toThrow(BannerFileNotFoundError);
    });

    it('should run correctly', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(
        true
      );
      jest.spyOn(path, 'join').mockReturnValue(
        'example/banner/twitter-banner.png'
      );
      jest.spyOn(fs, 'readFileSync').mockReturnValue(
        Buffer.alloc(5)
      );

      const toBuffer = jest.fn(() => Buffer.alloc(5));
      const resize = jest.fn(() => ({ toBuffer }));
      (sharp as any).mockImplementation(() => ({ resize }));

      const returnedValue = await service.getBannerBufferFromFile();

      expect(sharp).toBeCalledWith(Buffer.alloc(5));
      expect(returnedValue).toBeInstanceOf(Buffer);
    });
  });

  describe('generateBanner', () => {
    it('should be defined', () => {
      expect(service.generateBanner).toBeDefined();
    });

    it('should run correctly', async () => {
      const toBuffer = jest.fn();
      const composite = jest.fn(() => ({ toBuffer }));
      (sharp as any).mockImplementation(() => ({ composite }));

      jest.spyOn(service, 'composeProfile').mockResolvedValue(
        Buffer.alloc(5)
      );

      await service.generateBanner(Buffer.alloc(10), [Buffer.alloc(1), Buffer.alloc(2)]);

      expect(service.composeProfile).toHaveBeenNthCalledWith(1, Buffer.alloc(1));
      expect(service.composeProfile).toHaveBeenNthCalledWith(2, Buffer.alloc(2));
      expect(composite).toBeCalledWith(
        [
          {
            input: Buffer.alloc(5),
            top: 50,
            left: 1350,
          },
          {
            input: Buffer.alloc(5),
            top: 200,
            left: 1350,
          }
        ]
      );
    });
  });
});
