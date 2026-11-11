import { describe, expect, it } from 'vitest';
import {
  assetAccess,
  buildAssetTree,
  imageQuery,
  ownerLabel
} from '@/views/operation-management/asset/utils/asset-policy';

const folder = (id: string, ownerId: string, parentId: string | null = null) =>
  ({ id, ownerId, parentId, name: `目录${id}`, imageCount: 0 }) as ApiManagement.AssetFolder;
const owners = [
  { id: '1', username: '自己', isActive: true },
  { id: '2', username: '其他', isActive: false }
];
const policy = (codes: string[]) => assetAccess('1', code => codes.includes(code));

describe('素材权限与目录', () => {
  it('任一 read-all 显示全部入口，自有资源仍需 read', () => {
    const access = policy(['asset.image.read-all']);
    expect(access.showAll).toBe(true);
    expect(access.read('image', '1')).toBe(false);
    expect(access.read('image', '2')).toBe(true);
    expect(access.read('folder', '2')).toBe(false);
  });
  it('写动作同时要求 action 与对应资源范围', () => {
    const access = policy(['asset.image.upload', 'asset.image.read', 'asset.folder.read']);
    expect(access.write('image', 'upload', '1')).toBe(true);
    expect(access.write('image', 'upload', '2')).toBe(false);
    expect(access.write('folder', 'delete', '1')).toBe(false);
    expect(access.target('2', 'folder')).toBe(false);
    expect(access.target('1', 'folder')).toBe(true);
  });
  it('无 folder all 时不泄露他人目录名，仍可选该用户未分类', () => {
    const tree = buildAssetTree(
      'all',
      '1',
      owners,
      [folder('a', '1'), folder('b', '2')],
      policy(['asset.image.read-all', 'asset.folder.read', 'asset.image.read'])
    );
    expect(JSON.stringify(tree)).not.toContain('目录b');
    expect(JSON.stringify(tree)).toContain('unclassified:2');
    expect(JSON.stringify(tree)).toContain('其他');
  });
  it('父子目录按归属隔离，并包含每个用户未分类', () => {
    const tree = buildAssetTree(
      'all',
      '1',
      owners,
      [folder('a', '2'), folder('b', '2', 'a')],
      policy(['asset.folder.read-all', 'asset.image.read-all'])
    );
    expect(JSON.stringify(tree)).toContain('目录b');
    expect(JSON.stringify(tree)).toContain('unclassified:1');
    expect(JSON.stringify(tree)).toContain('unclassified:2');
  });
  it('未分类查询不与目录混用', () => {
    expect(
      imageQuery({ page: 3, pageSize: 24, keyword: ' 名称 ', ownerId: '2', folderId: 'a', unclassified: true })
    ).toEqual({ page: 3, pageSize: 24, keyword: '名称', ownerId: '2', unclassified: true });
  });
  it('用户名优先自己 store，其次 owners，最后 ID', () => {
    expect(ownerLabel('1', '1', '当前名字', owners)).toBe('当前名字');
    expect(ownerLabel('2', '1', '当前名字', owners)).toBe('其他');
    expect(ownerLabel('3', '1', '当前名字', owners)).toBe('3');
  });
});

it('readAll 显式表达全量能力；我的树直接展示目录和独立入口', () => {
  const access = policy(['asset.folder.read', 'asset.image.read', 'asset.image.read-all']);
  expect(access.readAll('folder')).toBe(false);
  expect(access.readAll('image')).toBe(true);
  const tree = buildAssetTree('mine', '1', owners, [folder('a', '1'), folder('b', '1', 'a')], access);
  expect(tree.map(item => item.key)).toEqual(['owner:1', 'a', 'unclassified:1']);
  expect(tree[0].children).toBeUndefined();
});

it('当前用户 store 名字为空时使用 owners 用户名而不是 ID', () => {
  expect(ownerLabel('1', '1', '', owners)).toBe('自己');
});
