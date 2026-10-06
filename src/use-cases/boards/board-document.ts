import { z } from 'zod';

export const BOARD_CONTENT_MAX_BYTES = 2 * 1024 * 1024;

const id = z.string().min(1).max(64);
/** Side of the node body its label or caption sits on (default bottom). */
const labelPosition = z.enum(['top', 'right', 'bottom', 'left']).optional();
const color = z.string().max(32).optional();
/** Rendered as href/src in the browser: only http(s), never javascript:/data: URLs. */
const httpUrl = z
  .string()
  .max(2048)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'URL must use http or https');

type RichAttrs = Record<string, string | number | boolean | null>;

type RichNode = {
  type: string;
  attrs?: RichAttrs;
  content?: RichNode[];
  marks?: { type: string; attrs?: RichAttrs }[];
  text?: string;
};

/** Tiptap attrs are flat primitives (heading level, link href, text align). */
const richAttrs = z
  .record(
    z.string(),
    z.union([z.string().max(2048), z.number(), z.boolean(), z.null()]),
  )
  .optional();

/** Tiptap/ProseMirror JSON. Rendered only through the editor schema, never as HTML. */
const richDoc: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string().max(64),
    attrs: richAttrs,
    content: z.array(richDoc).optional(),
    marks: z
      .array(
        z.object({
          type: z.string().max(64),
          attrs: richAttrs,
        }),
      )
      .optional(),
    text: z.string().max(20000).optional(),
  }),
);

const nodeBase = z.object({
  id,
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  parentId: id.optional(),
  zIndex: z.number().int().optional(),
});

export const boardNodeSchema = z.discriminatedUnion('type', [
  nodeBase.extend({
    type: z.literal('icon'),
    data: z.object({
      icon: z.string().max(64),
      label: z.string().max(2000),
      labelDoc: richDoc.optional(),
      labelPosition,
      color,
    }),
  }),
  nodeBase.extend({
    type: z.literal('text'),
    data: z.object({
      text: z.string().max(20000),
      doc: richDoc.optional(),
      fontSize: z.enum(['s', 'm', 'l', 'xl']).optional(),
      align: z.enum(['left', 'center', 'right']).optional(),
    }),
  }),
  nodeBase.extend({
    type: z.literal('image'),
    data: z.object({
      assetId: z.string().uuid(),
      width: z.number().positive(),
      height: z.number().positive(),
      alt: z.string().max(500).optional(),
      caption: z.string().max(2000).optional(),
      captionDoc: richDoc.optional(),
      labelPosition,
    }),
  }),
  nodeBase.extend({
    type: z.literal('link'),
    data: z.object({
      url: httpUrl,
      label: z.string().max(2000).optional(),
      preview: z
        .object({
          title: z.string().max(500).optional(),
          description: z.string().max(2000).optional(),
          faviconUrl: httpUrl.optional(),
          fetchedAt: z.string(),
        })
        .optional(),
    }),
  }),
  nodeBase.extend({
    type: z.literal('file'),
    data: z.object({
      assetId: z.string().uuid(),
      fileName: z.string().max(255),
      mimeType: z.string().max(255),
      size: z.number().int().nonnegative(),
    }),
  }),
  nodeBase.extend({
    type: z.literal('shape'),
    data: z.object({
      shape: z.enum([
        'rectangle',
        'rounded',
        'ellipse',
        'diamond',
        'triangle',
        'hexagon',
        'parallelogram',
        'cylinder',
      ]),
      text: z.string().max(20000),
      doc: richDoc.optional(),
      color,
      fill: z.enum(['solid', 'soft', 'none']).optional(),
      stroke: z.enum(['solid', 'dashed', 'dotted']).optional(),
    }),
  }),
  nodeBase.extend({
    type: z.literal('section'),
    data: z.object({ title: z.string().max(500), color }),
  }),
]);

export const boardEdgeSchema = z.object({
  id,
  source: id,
  target: id,
  sourceHandle: z.string().max(64).nullish(),
  targetHandle: z.string().max(64).nullish(),
  label: z.string().max(2000).optional(),
  data: z
    .object({
      arrowStart: z.boolean().optional(),
      arrowEnd: z.boolean().optional(),
      style: z.enum(['solid', 'dashed']).optional(),
      labelDoc: richDoc.optional(),
    })
    .optional(),
});

export const boardDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }),
  nodes: z.array(boardNodeSchema),
  edges: z.array(boardEdgeSchema),
});

export type BoardNode = z.infer<typeof boardNodeSchema>;
export type BoardEdge = z.infer<typeof boardEdgeSchema>;
export type BoardDocument = z.infer<typeof boardDocumentSchema>;

export const EMPTY_BOARD_DOCUMENT: BoardDocument = {
  schemaVersion: 1,
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [],
  edges: [],
};

/**
 * Structural rules zod cannot express. Returns the first violation found, or null.
 * Nodes must be ordered parents-first (React Flow requirement), which also rules out cycles.
 */
export const validateBoardGraph = (doc: BoardDocument): string | null => {
  const seen = new Map<string, BoardNode>();

  for (const node of doc.nodes) {
    if (seen.has(node.id)) {
      return `Duplicate node id "${node.id}"`;
    }

    if (node.parentId !== undefined) {
      const parent = seen.get(node.parentId);
      if (!parent) {
        const parentExists = doc.nodes.some((n) => n.id === node.parentId);
        return parentExists
          ? `Node "${node.id}" is listed before its parent "${node.parentId}"`
          : `Node "${node.id}" references missing parent "${node.parentId}"`;
      }
      if (parent.type !== 'section') {
        return `Node "${node.id}" parent "${node.parentId}" is not a section`;
      }
    }

    seen.set(node.id, node);
  }

  const edgeIds = new Set<string>();
  for (const edge of doc.edges) {
    if (edgeIds.has(edge.id)) {
      return `Duplicate edge id "${edge.id}"`;
    }
    edgeIds.add(edge.id);
    if (!seen.has(edge.source)) {
      return `Edge "${edge.id}" references missing source "${edge.source}"`;
    }
    if (!seen.has(edge.target)) {
      return `Edge "${edge.id}" references missing target "${edge.target}"`;
    }
  }

  return null;
};

export const collectAssetIds = (doc: BoardDocument): string[] => {
  const ids = new Set<string>();
  for (const node of doc.nodes) {
    if (node.type === 'image' || node.type === 'file') {
      ids.add(node.data.assetId);
    }
  }
  return [...ids];
};
