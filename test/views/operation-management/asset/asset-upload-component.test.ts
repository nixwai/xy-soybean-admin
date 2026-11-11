import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createSSRApp, h } from 'vue';
import * as Vue from 'vue';
import { parse, compileTemplate, compileScript } from '@vue/compiler-sfc';
import { renderToString } from '@vue/server-renderer';
import * as Naive from 'naive-ui';
import { NUpload, NUploadDragger } from 'naive-ui';
import { transpileModule, ModuleKind, ScriptTarget } from 'typescript';

const filename = 'src/views/operation-management/asset/components/asset-upload-panel.vue';
const source = readFileSync(filename, 'utf8');
const { descriptor } = parse(source);
describe('上传组件契约', () => {
  it('NUploadDragger 必须嵌套在真实 NUpload 中且禁用默认上传', () => {
    const template = descriptor.template!.content;
    expect(template).toMatch(
      /<NUpload\b[^>]*:default-upload="false"[^>]*>[\s\S]*<NUploadDragger\b[\s\S]*<\/NUploadDragger>[\s\S]*<\/NUpload>/
    );
    expect(compileTemplate({ source: template, filename, id: 'asset-upload' }).errors).toEqual([]);
  });
  it('Naive UI 真实组件服务端渲染不抛 injection 错误', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          NUpload,
          { defaultUpload: false, showFileList: false },
          { default: () => h(NUploadDragger, null, { default: () => '拖拽图片' }) }
        )
    });
    await expect(renderToString(app)).resolves.toContain('拖拽图片');
  });
});

it('编译实际上传 SFC 并使用真实 Naive UI 渲染（不替换组件）', async () => {
  const script = compileScript(descriptor, { id: 'upload-contract', inlineTemplate: true });
  const compiled = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 }
  }).outputText;
  const modules: Record<string, unknown> = {
    vue: Vue,
    'naive-ui': Naive,
    '@vueuse/core': { useEventListener: () => {} },
    '../hooks/use-asset-upload-limits': {
      useAssetUploadLimits: () => ({
        limits: Vue.ref({ maxFiles: 2, maxFileSize: 100, maxBatchSize: 200 }),
        loading: Vue.ref(false),
        error: Vue.ref(''),
        reload: () => {}
      })
    },
    '../hooks/use-asset-upload': {
      useAssetUpload: () => ({
        entries: Vue.ref([]),
        busy: Vue.ref(false),
        hasFailed: Vue.ref(false),
        add: () => {},
        retry: () => {}
      })
    }
  };
  const module = { exports: {} as { default?: Vue.Component } };
  new Function('require', 'module', 'exports', compiled)((id: string) => modules[id], module, module.exports);
  const app = createSSRApp({
    render: () => h(module.exports.default!, { ownerId: '1', folderId: null, allowed: () => true })
  });
  await expect(renderToString(app)).resolves.toContain('将图片拖拽至此');
});
