/**
 * Integração OPCIONAL com Open Food Facts (https://world.openfoodfacts.org).
 * - API pública, sem chave, com CORS habilitado para leitura.
 * - Dados sob licença ODbL; imagens sob CC BY-SA. Atribuição exibida na UI.
 * - Usada somente quando o usuário informa um código de barras (EAN).
 * - Não definimos User-Agent no browser (cabeçalho proibido); o app funciona sem ela.
 */
export interface OffProduct {
  name: string
  imageUrl?: string
  brand?: string
}

export async function lookupBarcode(barcode: string, signal?: AbortSignal): Promise<OffProduct | null> {
  const code = barcode.replace(/\D/g, '')
  if (code.length < 8 || code.length > 14) return null
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_pt,brands,image_front_small_url`,
      { signal },
    )
    if (!res.ok) return null
    const json: unknown = await res.json()
    if (typeof json !== 'object' || json === null) return null
    const product = (json as { product?: Record<string, unknown> }).product
    if (!product) return null
    const name = (product.product_name_pt || product.product_name) as string | undefined
    if (!name) return null
    const img = product.image_front_small_url
    return {
      name,
      brand: typeof product.brands === 'string' ? product.brands : undefined,
      imageUrl: typeof img === 'string' && img.startsWith('https://images.openfoodfacts.org/') ? img : undefined,
    }
  } catch {
    return null
  }
}
