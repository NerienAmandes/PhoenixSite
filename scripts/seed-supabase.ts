#!/usr/bin/env node
/**
 * scripts/seed-supabase.ts
 * Одноразовая миграция данных из src/data в Supabase.
 *
 * По умолчанию работает в dry-run режиме: только проверяет данные и печатает
 * отчёт в stdout. Для фактической записи передайте --apply.
 *
 * Использование:
 *   npx tsx scripts/seed-supabase.ts            # dry-run (по умолчанию)
 *   npx tsx scripts/seed-supabase.ts --apply    # фактическая запись
 *
 * Требования:
 *   В .env.local должны быть определены:
 *     SUPABASE_URL
 *     SUPABASE_SERVICE_ROLE_KEY
 *
 * Поведение:
 *   - Прервётся с exit 1, если найдены credit'ы с ID, которых нет в members.
 *   - В --apply режиме перезаписывает release_credits для обрабатываемых релизов
 *     (delete + insert). Это сделано намеренно для идемпотентности.
 *
 * Используется node:https напрямую, без fetch/supabase-js, чтобы избежать
 * проблем с кириллицей в глобальных fetch-полифиллах (TypeError "Cannot convert
 * argument to a ByteString").
 */

import { existsSync, readFileSync } from 'node:fs'
import { request as httpsRequest } from 'node:https'
import { resolve } from 'node:path'
import { URL } from 'node:url'
import { members } from '../src/data/members'
import { releases } from '../src/data/releases'

// ---------- CLI args ----------

const args = process.argv.slice(2)
const isApply = args.includes('--apply')

// ---------- Env loading (без dotenv) ----------

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return
  // strip UTF-8 BOM if present
  let content = readFileSync(path, 'utf-8')
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1)
  for (const line of content.split('\n')) {
    const trimmed = line.replace(/\r$/, '').trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function isAscii(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 0x7f) return false
  }
  return true
}

function exitWithError(msg: string): never {
  console.error(`\nERROR: ${msg}`)
  process.exit(1)
}

// ---------- Data mapping ----------

type DbMember = {
  slug: string
  display_name: string
  role: string | null
  tags: string[]
  birth_mmdd: string | null
  bio: string | null
  avatar_path: string | null
  socials: Record<string, unknown>
  is_published: boolean
}

type DbRelease = {
  slug: string
  title: string
  original_artist: string | null
  cover_url: string | null
  release_date: string | null
  status: 'upcoming' | 'released'
  platforms: Record<string, unknown>
  description: string | null
  current_stage: number
  is_published: boolean
}

type CreditRow = {
  release_id: string
  member_id: string
  role_label: string | null
}

function mapMember(m: (typeof members)[number]): DbMember {
  return {
    slug: m.id,
    display_name: m.name,
    role: m.role ?? null,
    tags: m.tags ?? [],
    birth_mmdd: m.birthDate ?? null,
    bio: m.bio ?? null,
    avatar_path: m.avatar ?? null,
    socials: (m.socials ?? {}) as Record<string, unknown>,
    is_published: true,
  }
}

function mapRelease(r: (typeof releases)[number]): DbRelease {
  return {
    slug: r.id,
    title: r.title,
    original_artist: r.originalArtist ?? null,
    cover_url: r.cover ?? null,
    release_date: r.releaseDate ?? null,
    status: r.status,
    platforms: (r.platforms ?? {}) as Record<string, unknown>,
    description: r.description ?? null,
    current_stage: r.currentStage ?? 0,
    is_published: true,
  }
}

// ---------- Native https helpers ----------

function getSupabaseConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    exitWithError(
      'SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть определены в .env.local.\n' +
        'См. .env.local.example для справки.',
    )
  }
  // Diagnostic: печатаем превью и длину, чтобы было видно, загрузилось ли реальное значение.
  const urlPreview = url!.slice(0, 40) + (url!.length > 40 ? '...' : '')
  const keyPreview = key!.slice(0, 20) + (key!.length > 20 ? '...' : '')
  console.log(`  SUPABASE_URL (len=${url!.length}): ${urlPreview}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY (len=${key!.length}): ${keyPreview}`)
  if (!isAscii(url!) || !isAscii(key!)) {
    exitWithError(
      'SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY содержат не-ASCII символы.\n' +
        'Скорее всего, в .env.local остался заполнитель из .env.local.example (например, "ВАШ_SERVICE_ROLE_KEY").\n' +
        'Замени его на реальные значения из Supabase Dashboard → Settings → API.',
    )
  }
  if (url!.includes('ВАШ') || key!.includes('ВАШ') || key!.toUpperCase() === 'SUPABASE_SERVICE_ROLE_KEY') {
    exitWithError(
      'Похоже, SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY — это заполнитель, а не реальный ключ.\n' +
        'Открой Supabase Dashboard → Settings → API и скопируй:\n' +
        '  - Project URL → SUPABASE_URL\n' +
        '  - service_role (secret) → SUPABASE_SERVICE_ROLE_KEY',
    )
  }
  return { url: url!, key: key! }
}

type PostgrestError = { code?: string; message: string; details?: string; hint?: string }

type PostgrestResponse = {
  status: number
  body: string
  json: unknown
}

async function pgRequest(
  cfg: { url: string; key: string },
  options: {
    method: 'GET' | 'POST' | 'DELETE'
    path: string
    body?: unknown
    extraHeaders?: Record<string, string>
  },
): Promise<PostgrestResponse> {
  const url = new URL(`${cfg.url}${options.path}`)

  const headers: Record<string, string> = {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
  }

  let payload: Buffer | undefined
  if (options.body !== undefined) {
    const json = JSON.stringify(options.body)
    payload = Buffer.from(json, 'utf-8')
    headers['Content-Type'] = 'application/json'
    headers['Content-Length'] = String(payload.length)
  }

  if (options.extraHeaders) {
    Object.assign(headers, options.extraHeaders)
  }

  return new Promise<PostgrestResponse>((resolve, reject) => {
    const req = httpsRequest(
      {
        method: options.method,
        hostname: url.hostname,
        path: url.pathname + url.search,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk as Buffer))
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8')
          let json: unknown = null
          if (body) {
            try {
              json = JSON.parse(body)
            } catch {
              json = null
            }
          }
          resolve({ status: res.statusCode ?? 0, body, json })
        })
      },
    )
    req.on('error', reject)
    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

async function pgUpsert(
  cfg: { url: string; key: string },
  table: string,
  rows: unknown[],
  onConflict: string,
): Promise<{ rows: unknown[] }> {
  const path = `/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`
  const res = await pgRequest(cfg, {
    method: 'POST',
    path,
    body: rows,
    extraHeaders: { Prefer: 'resolution=merge-duplicates,return=representation' },
  })
  if (res.status < 200 || res.status >= 300) {
    const err = (res.json as PostgrestError | null) ?? { message: res.body }
    exitWithError(
      `${table} upsert failed (${res.status}): ${err.message}${err.details ? ` (${err.details})` : ''}`,
    )
  }
  if (!res.body) return { rows: [] }
  return { rows: (res.json as unknown[]) ?? [] }
}

async function pgSelect(
  cfg: { url: string; key: string },
  table: string,
  select: string,
): Promise<unknown[]> {
  const path = `/rest/v1/${table}?select=${encodeURIComponent(select)}`
  const res = await pgRequest(cfg, { method: 'GET', path })
  if (res.status < 200 || res.status >= 300) {
    const err = (res.json as PostgrestError | null) ?? { message: res.body }
    exitWithError(`${table} select failed (${res.status}): ${err.message}`)
  }
  if (!res.body) return []
  return (res.json as unknown[]) ?? []
}

async function pgDelete(
  cfg: { url: string; key: string },
  table: string,
  filter: string,
): Promise<void> {
  const path = `/rest/v1/${table}?${filter}`
  const res = await pgRequest(cfg, { method: 'DELETE', path })
  if (res.status < 200 || res.status >= 300) {
    exitWithError(`${table} delete failed (${res.status}): ${res.body}`)
  }
}

async function pgInsert(
  cfg: { url: string; key: string },
  table: string,
  rows: unknown[],
): Promise<void> {
  const path = `/rest/v1/${table}`
  const res = await pgRequest(cfg, {
    method: 'POST',
    path,
    body: rows,
    extraHeaders: { Prefer: 'return=minimal' },
  })
  if (res.status < 200 || res.status >= 300) {
    const err = (res.json as PostgrestError | null) ?? { message: res.body }
    exitWithError(
      `${table} insert failed (${res.status}): ${err.message}${err.details ? ` (${err.details})` : ''}`,
    )
  }
}

// ---------- Main ----------

async function main() {
  loadEnvFile(resolve(process.cwd(), '.env.local'))

  console.log('=== seed-supabase ===')
  console.log(`Mode: ${isApply ? 'APPLY' : 'DRY-RUN'}`)

  // 1. members
  console.log('\n--- members ---')
  console.log(`Count: ${members.length}`)
  for (const m of members) {
    console.log(`  ${m.id} -> ${m.name}`)
  }

  // 2. releases
  console.log('\n--- releases ---')
  console.log(`Count: ${releases.length}`)
  for (const r of releases) {
    console.log(`  ${r.id} -> ${r.title} (${r.status})`)
  }

  // 3. credits validation
  const memberIds = new Set(members.map((m) => m.id))
  console.log('\n--- credits validation ---')
  let hasUnresolved = false
  const creditsByRelease = new Map<string, string[]>()
  let totalCredits = 0
  for (const r of releases) {
    for (const cid of r.credits ?? []) {
      if (!memberIds.has(cid)) {
        console.error(`  UNRESOLVED: release=${r.id} member=${cid}`)
        hasUnresolved = true
        continue
      }
      const list = creditsByRelease.get(r.id) ?? []
      list.push(cid)
      creditsByRelease.set(r.id, list)
      totalCredits += 1
    }
  }
  if (hasUnresolved) {
    exitWithError('unresolved credits detected; aborting')
  }
  console.log(`Total credits: ${totalCredits}`)
  console.log('OK')

  if (!isApply) {
    console.log('\n[DRY-RUN] no changes applied.')
    console.log('Re-run with --apply to write to Supabase.')
    return
  }

  // ---- apply ----
  const cfg = getSupabaseConfig()
  console.log('\n[APPLY] writing to Supabase...')

  // 4. upsert members
  const memberRows = members.map(mapMember)
  await pgUpsert(cfg, 'members', memberRows, 'slug')
  console.log(`  members: upserted ${memberRows.length}`)

  // 5. upsert releases
  const releaseRows = releases.map(mapRelease)
  await pgUpsert(cfg, 'releases', releaseRows, 'slug')
  console.log(`  releases: upserted ${releaseRows.length}`)

  // 6. resolve slug -> uuid
  const dbMembers = (await pgSelect(cfg, 'members', 'id,slug')) as Array<{ id: string; slug: string }>
  const slugToUuid = new Map<string, string>()
  for (const m of dbMembers) {
    slugToUuid.set(m.slug, m.id)
  }

  const dbReleases = (await pgSelect(cfg, 'releases', 'id,slug')) as Array<{ id: string; slug: string }>
  const releaseSlugToUuid = new Map<string, string>()
  for (const r of dbReleases) {
    releaseSlugToUuid.set(r.slug, r.id)
  }

  // 7. release_credits: delete + insert для каждого релиза
  const creditRows: CreditRow[] = []
  for (const [releaseSlug, memberSlugs] of creditsByRelease) {
    const releaseUuid = releaseSlugToUuid.get(releaseSlug)
    if (!releaseUuid) {
      exitWithError(`release slug ${releaseSlug} not found after upsert`)
    }
    await pgDelete(cfg, 'release_credits', `release_id=eq.${releaseUuid}`)
    for (const memberSlug of memberSlugs) {
      const memberUuid = slugToUuid.get(memberSlug)
      if (!memberUuid) {
        exitWithError(`member slug ${memberSlug} not found after upsert`)
      }
      creditRows.push({
        release_id: releaseUuid,
        member_id: memberUuid,
        role_label: null,
      })
    }
  }

  if (creditRows.length > 0) {
    await pgInsert(cfg, 'release_credits', creditRows)
  }
  console.log(`  release_credits: inserted ${creditRows.length}`)

  console.log('\n[APPLY] done.')
}

main().catch((e: unknown) => {
  console.error('\n[FATAL]')
  if (e instanceof Error) {
    console.error(e.message)
    if (e.stack) console.error(e.stack)
  } else {
    console.error(e)
  }
  process.exit(1)
})
