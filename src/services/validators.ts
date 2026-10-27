import type {
  BackupData,
  Category,
  ListItem,
  Product,
  Settings,
  ShoppingList,
} from '@/models'
import { PRODUCT_UNITS } from '@/models'

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isOptStr = (v: unknown) => v === undefined || isStr(v)
const isUnit = (v: unknown) => isStr(v) && (PRODUCT_UNITS as readonly string[]).includes(v)

export function isListItem(v: unknown): v is ListItem {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.productId) &&
    isStr(v.name) &&
    isStr(v.categoryId) &&
    isNum(v.quantity) &&
    isUnit(v.unit) &&
    typeof v.purchased === 'boolean' &&
    isNum(v.position) &&
    isOptStr(v.notes) &&
    isOptStr(v.packageSize) &&
    (v.price === undefined || isNum(v.price))
  )
}

export function isShoppingList(v: unknown): v is ShoppingList {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.name) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt) &&
    (v.status === 'active' || v.status === 'archived') &&
    typeof v.isTemplate === 'boolean' &&
    Array.isArray(v.items) &&
    v.items.every(isListItem)
  )
}

export function isProduct(v: unknown): v is Product {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.name) &&
    isStr(v.categoryId) &&
    isUnit(v.defaultUnit) &&
    isNum(v.suggestedQuantity) &&
    Array.isArray(v.keywords) &&
    v.keywords.every(isStr) &&
    typeof v.isCustom === 'boolean'
  )
}

export function isCategory(v: unknown): v is Category {
  return isObj(v) && isStr(v.id) && isStr(v.name) && isStr(v.emoji) && isNum(v.order)
}

export function isSettings(v: unknown): v is Settings {
  return (
    isObj(v) &&
    ['light', 'dark', 'system'].includes(v.theme as string) &&
    ['category', 'alphabetical', 'manual', 'pending'].includes(v.sortMode as string) &&
    isStr(v.repositoryUrl)
  )
}

export const isListArray = (v: unknown): v is ShoppingList[] => Array.isArray(v) && v.every(isShoppingList)
export const isProductArray = (v: unknown): v is Product[] => Array.isArray(v) && v.every(isProduct)
export const isCategoryArray = (v: unknown): v is Category[] => Array.isArray(v) && v.every(isCategory)
export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)
export const isNullableString = (v: unknown): v is string | null => v === null || isStr(v)

export function isBackup(v: unknown): v is BackupData {
  return (
    isObj(v) &&
    v.app === 'meumercado' &&
    isNum(v.schemaVersion) &&
    isListArray(v.lists) &&
    isProductArray(v.customProducts) &&
    isCategoryArray(v.customCategories) &&
    isStringArray(v.favorites) &&
    isSettings(v.settings) &&
    isNullableString(v.activeListId)
  )
}
