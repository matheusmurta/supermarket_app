import { expect, test } from '@playwright/test'

test('jornada completa: exemplo, marcar, persistir, compartilhar', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('use-sample').click()
  await expect(page.getByTestId('item-p-arroz')).toBeVisible()

  await page.getByLabel('Marcar Arroz como comprado').check({ force: true })
  await expect(page.getByText('1 de 17 itens comprados')).toBeVisible()

  await page.reload()
  await expect(page.getByText('1 de 17 itens comprados')).toBeVisible()

  await page.getByTestId('share-btn').click()
  await expect(page.getByTestId('share-preview')).toContainText('☑ Arroz')
  const href = await page.getByTestId('whatsapp-link').getAttribute('href')
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/)

  // sem overflow horizontal
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('catálogo: busca sem acento e adição', async ({ page }) => {
  await page.goto('/#/catalogo')
  await page.getByRole('searchbox').fill('feijao preto')
  await page.getByLabel('Adicionar Feijão preto à lista').click()
  await expect(page.getByTestId('product-p-feijao-preto').first()).toContainText('Na lista')
  await expect(page.getByTestId('selected-products')).toContainText('Feijão preto')
})
