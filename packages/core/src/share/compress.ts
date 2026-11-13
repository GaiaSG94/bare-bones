export async function deflateRaw(text: string): Promise<Uint8Array> {
  const source = new Response(text).body;
  if (source === null) throw new Error("deflate-raw: no source stream");
  const compressed = await new Response(
    source.pipeThrough(new CompressionStream("deflate-raw")),
  ).arrayBuffer();
  return new Uint8Array(compressed);
}

export async function inflateRaw(bytes: Uint8Array): Promise<string> {
  const source = new Response(new Uint8Array(bytes)).body;
  if (source === null) throw new Error("inflate-raw: no source stream");
  const inflated = await new Response(
    source.pipeThrough(new DecompressionStream("deflate-raw")),
  ).arrayBuffer();
  return new TextDecoder().decode(inflated);
}
