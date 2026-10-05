export class UnsupportedAssetTypeError extends Error {
  constructor() {
    super('Tipo de imagem não suportado (use png, jpeg, gif ou webp)');
  }
}
