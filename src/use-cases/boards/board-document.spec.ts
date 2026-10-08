import { describe, expect, it } from 'vitest';

import {
  type BoardDocument,
  boardDocumentSchema,
  collectAssetIds,
  EMPTY_BOARD_DOCUMENT,
  validateBoardGraph,
} from './board-document';

const ASSET_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const doc = (partial: Partial<BoardDocument>): BoardDocument => ({
  ...EMPTY_BOARD_DOCUMENT,
  ...partial,
});

const section = (id: string, parentId?: string) => ({
  id,
  type: 'section' as const,
  position: { x: 0, y: 0 },
  parentId,
  data: { title: id },
});

const icon = (id: string, parentId?: string) => ({
  id,
  type: 'icon' as const,
  position: { x: 0, y: 0 },
  parentId,
  data: { icon: 'book', label: id },
});

describe('boardDocumentSchema', () => {
  it('preserves arrow appearance alongside rich labels through validation', () => {
    const data = { path: 'elbow', head: 'diamond', style: 'dotted', arrowStart: true, arrowEnd: false, labelDoc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Connect' }] }] } } as const;
    const parsed = boardDocumentSchema.parse(doc({ edges: [{ id: 'e', source: 'a', target: 'b', data }] }));
    expect(parsed.edges[0].data).toEqual(data);
    expect(boardDocumentSchema.safeParse(doc({ edges: [{ id: 'e', source: 'a', target: 'b', data: { path: 'unknown' } as never }] })).success).toBe(false);
  });
  it('accepts every node type', () => {
    const result = boardDocumentSchema.safeParse(
      doc({
        nodes: [
          section('s1'),
          icon('i1', 's1'),
          {
            id: 't1',
            type: 'text',
            position: { x: 1, y: 1 },
            data: { text: 'hi' },
          },
          {
            id: 'img',
            type: 'image',
            position: { x: 1, y: 1 },
            data: { assetId: ASSET_ID, width: 10, height: 10 },
          },
          {
            id: 'l1',
            type: 'link',
            position: { x: 1, y: 1 },
            data: { url: 'https://example.com' },
          },
          {
            id: 'f1',
            type: 'file',
            position: { x: 1, y: 1 },
            data: {
              assetId: ASSET_ID,
              fileName: 'a.pdf',
              mimeType: 'application/pdf',
              size: 3,
            },
          },
          {
            id: 'sh1',
            type: 'shape',
            position: { x: 1, y: 1 },
            width: 160,
            height: 100,
            parentId: 's1',
            data: {
              shape: 'diamond',
              text: 'Decide',
              color: 'blue',
              fill: 'soft',
              stroke: 'dashed',
            },
          },
        ],
        edges: [{ id: 'e1', source: 'i1', target: 's1', label: 'x' }],
      }),
    );
    expect(result.success).toBe(true);
  });

  it('keeps label positions on icons and images', () => {
    const result = boardDocumentSchema.safeParse(
      doc({
        nodes: [
          {
            ...icon('i1'),
            data: { ...icon('i1').data, labelPosition: 'right' },
          },
          {
            id: 'img',
            type: 'image',
            position: { x: 0, y: 0 },
            data: {
              assetId: ASSET_ID,
              width: 10,
              height: 10,
              labelPosition: 'top',
            },
          },
        ],
      }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.nodes.map((node) => node.data)).toMatchObject([
      { labelPosition: 'right' },
      { labelPosition: 'top' },
    ]);
  });

  it('rejects an unknown label position', () => {
    const result = boardDocumentSchema.safeParse(
      doc({
        nodes: [
          {
            ...icon('i1'),
            data: { ...icon('i1').data, labelPosition: 'middle' },
          } as never,
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects unknown shapes', () => {
    const result = boardDocumentSchema.safeParse(
      doc({
        nodes: [
          {
            id: 'sh1',
            type: 'shape',
            position: { x: 0, y: 0 },
            data: { shape: 'blob', text: '' },
          } as never,
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects unknown node type', () => {
    const result = boardDocumentSchema.safeParse(
      doc({ nodes: [{ ...icon('a'), type: 'banana' } as never] }),
    );
    expect(result.success).toBe(false);
  });
});

describe('rich text fields', () => {
  const rich = {
    type: 'doc',
    content: [
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'hi',
                    marks: [{ type: 'bold' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const parse = (nodes: unknown[], edges: unknown[] = []) =>
    boardDocumentSchema.safeParse(doc({ nodes, edges } as never));

  it('keeps legacy plain text nodes valid', () => {
    expect(
      parse([
        {
          id: 't',
          type: 'text',
          position: { x: 0, y: 0 },
          data: { text: 'a' },
        },
      ]).success,
    ).toBe(true);
  });

  it('preserves rich docs, font size, align and captions', () => {
    const result = parse(
      [
        {
          id: 't',
          type: 'text',
          position: { x: 0, y: 0 },
          data: {
            text: 'hi',
            doc: rich,
            fontSize: 'l',
            align: 'center',
          },
        },
        {
          id: 'i',
          type: 'icon',
          position: { x: 0, y: 0 },
          data: { icon: 'book', label: 'hi', labelDoc: rich },
        },
        {
          id: 'img',
          type: 'image',
          position: { x: 0, y: 0 },
          data: {
            assetId: ASSET_ID,
            width: 10,
            height: 10,
            caption: 'hi',
            captionDoc: rich,
          },
        },
      ],
      [
        {
          id: 'e',
          source: 't',
          target: 'i',
          label: 'hi',
          data: { labelDoc: rich },
        },
      ],
    );
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    const [text, iconNode, image] = result.data.nodes;
    expect(text.data).toEqual({
      text: 'hi',
      doc: rich,
      fontSize: 'l',
      align: 'center',
    });
    expect(iconNode.data).toMatchObject({ labelDoc: rich });
    expect(image.data).toMatchObject({ caption: 'hi', captionDoc: rich });
    expect(result.data.edges[0].data).toEqual({ labelDoc: rich });
  });

  it('rejects unknown font size and oversized caption', () => {
    expect(
      parse([
        {
          id: 't',
          type: 'text',
          position: { x: 0, y: 0 },
          data: { text: 'a', fontSize: 'huge' },
        },
      ]).success,
    ).toBe(false);
    expect(
      parse([
        {
          id: 'img',
          type: 'image',
          position: { x: 0, y: 0 },
          data: {
            assetId: ASSET_ID,
            width: 1,
            height: 1,
            caption: 'x'.repeat(2001),
          },
        },
      ]).success,
    ).toBe(false);
  });
});

describe('link node URLs', () => {
  const link = (url: string, faviconUrl?: string) =>
    boardDocumentSchema.safeParse(
      doc({
        nodes: [
          {
            id: 'l',
            type: 'link',
            position: { x: 0, y: 0 },
            data: {
              url,
              preview: faviconUrl
                ? { faviconUrl, fetchedAt: 'now' }
                : undefined,
            },
          },
        ],
      }),
    ).success;

  it('accepts http and https only', () => {
    expect(link('https://a.io', 'http://a.io/favicon.ico')).toBe(true);
    expect(link('javascript:alert(1)')).toBe(false);
    expect(link('data:text/html,hi')).toBe(false);
    expect(link('https://a.io', 'javascript:alert(1)')).toBe(false);
  });
});

describe('validateBoardGraph', () => {
  it('accepts nested sections ordered parents first, and section-to-section edges', () => {
    const result = validateBoardGraph(
      doc({
        nodes: [
          section('s1'),
          section('s2', 's1'),
          section('s3', 's2'),
          icon('i1', 's3'),
          section('s4'),
        ],
        edges: [{ id: 'e1', source: 's3', target: 's4' }],
      }),
    );
    expect(result).toBeNull();
  });

  it('rejects missing parent', () => {
    expect(validateBoardGraph(doc({ nodes: [icon('i1', 'ghost')] }))).toMatch(
      /missing parent/,
    );
  });

  it('rejects non-section parent', () => {
    expect(
      validateBoardGraph(doc({ nodes: [icon('i1'), icon('i2', 'i1')] })),
    ).toMatch(/not a section/);
  });

  it('rejects child listed before its parent', () => {
    expect(
      validateBoardGraph(doc({ nodes: [icon('i1', 's1'), section('s1')] })),
    ).toMatch(/before its parent/);
  });

  it('rejects parent cycles', () => {
    expect(
      validateBoardGraph(
        doc({ nodes: [section('a', 'b'), section('b', 'a')] }),
      ),
    ).not.toBeNull();
    expect(
      validateBoardGraph(doc({ nodes: [section('a', 'a')] })),
    ).not.toBeNull();
  });

  it('rejects edges to unknown nodes', () => {
    expect(
      validateBoardGraph(
        doc({
          nodes: [icon('i1')],
          edges: [{ id: 'e1', source: 'i1', target: 'ghost' }],
        }),
      ),
    ).toMatch(/missing target/);
  });

  it('rejects duplicate node and edge ids', () => {
    expect(validateBoardGraph(doc({ nodes: [icon('a'), icon('a')] }))).toMatch(
      /Duplicate node/,
    );
    expect(
      validateBoardGraph(
        doc({
          nodes: [icon('a'), icon('b')],
          edges: [
            { id: 'e', source: 'a', target: 'b' },
            { id: 'e', source: 'b', target: 'a' },
          ],
        }),
      ),
    ).toMatch(/Duplicate edge/);
  });
});

describe('collectAssetIds', () => {
  it('collects unique image and file asset ids', () => {
    const ids = collectAssetIds(
      doc({
        nodes: [
          {
            id: 'a',
            type: 'image',
            position: { x: 0, y: 0 },
            data: { assetId: ASSET_ID, width: 1, height: 1 },
          },
          {
            id: 'b',
            type: 'file',
            position: { x: 0, y: 0 },
            data: {
              assetId: ASSET_ID,
              fileName: 'x',
              mimeType: 'x',
              size: 1,
            },
          },
          icon('c'),
        ],
      }),
    );
    expect(ids).toEqual([ASSET_ID]);
  });
});
