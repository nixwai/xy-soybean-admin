import { describe, expect, it } from 'vitest';
import { createServiceConfig, getServiceBaseURL } from '@/utils/service';

describe('服务地址配置', () => {
  const env = {
    VITE_SERVICE_BASE_URL: 'http://api.example.com/api',
    VITE_OTHER_SERVICE_BASE_URL: '{ demo: "http://demo.example.com" }'
  } as Env.ImportMeta;

  it('解析 JSON5 形式的额外服务地址', () => {
    expect(createServiceConfig(env)).toEqual({
      baseURL: 'http://api.example.com/api',
      proxyPattern: '/proxy-default',
      other: [
        {
          key: 'demo',
          baseURL: 'http://demo.example.com',
          proxyPattern: '/proxy-demo'
        }
      ]
    });
  });

  it('代理模式返回默认和额外服务代理地址', () => {
    expect(getServiceBaseURL(env, true)).toEqual({
      baseURL: '/proxy-default',
      otherBaseURL: { demo: '/proxy-demo' }
    });
    expect(getServiceBaseURL(env, false)).toEqual({
      baseURL: 'http://api.example.com/api',
      otherBaseURL: { demo: 'http://demo.example.com' }
    });
  });

  it('额外服务配置无效时保留主服务地址并使用空服务表', () => {
    expect(
      createServiceConfig({
        ...env,
        VITE_OTHER_SERVICE_BASE_URL: '{'
      } as Env.ImportMeta)
    ).toMatchObject({
      baseURL: env.VITE_SERVICE_BASE_URL,
      other: []
    });
  });
});
