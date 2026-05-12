# Local-First Implementation Roadmap

**Status:** In Progress  
**Last Updated:** 2026-05-11

## Overview

This document tracks the implementation progress of local-first architecture across all entities in the Pluto application.

## Architecture Components

### ✅ Core Infrastructure (Completed)

- [x] **Sync Utilities** (`lib/local/sync-utils.ts`)
  - Timestamp comparison
  - Conflict resolution (last-write-wins)
  - Sync metadata generation
  - Exponential backoff for retries

- [x] **Session Repository** (`lib/local/session-repository.ts`)
  - Current user tracking
  - Last sync timestamp
  - Session lifecycle management

- [x] **Outbox Processor** (`lib/local/outbox-processor.ts`)
  - Queue pending operations
  - Process operations with retry logic
  - Cleanup old completed operations
  - Entity-specific handlers registration

- [x] **Sync Coordinator** (`lib/local/sync-coordinator.ts`)
  - Orchestrate sync lifecycle
  - Online/offline detection
  - Periodic sync (5 min interval)
  - Entity sync handlers registration

- [x] **Dexie Database** (`lib/local/db.ts`)
  - IndexedDB wrapper
  - Schema versioning
  - Type-safe table definitions

- [x] **Entity Registration** (`lib/local/register-entities.ts`)
  - Centralized sync handler registration
  - Outbox handler registration
  - Redux integration

- [x] **Auth Integration** (`features/auth/context.tsx`)
  - Login/register flow with local persistence
  - Profile load from local DB first
  - Logout cleanup
  - Sync coordinator lifecycle

- [x] **App Initialization** (`main.tsx`)
  - Start sync coordinator on mount
  - Stop sync coordinator on unmount

## Entity Implementation Status

### ✅ Phase 1: User & Settings (Completed)

#### User Entity

- [x] Schema definition (`entities/user/local/schema.ts`)
- [x] Repository with CRUD operations (`entities/user/local/repository.ts`)
- [x] Sync handler registration
- [x] Integration with AuthProvider
- [x] Tests
- [ ] Outbox helpers (not needed - read-only from client perspective)
- [x] FSD architecture review and refactoring
  - Removed unused `status` field from slice
  - Moved `changePassword` API to `features/change-password`
  - Fixed layer boundaries (page → feature → entity)

#### Settings Entity

- [x] Schema definition (`entities/settings/local/schema.ts`)
- [x] Repository with CRUD operations (`entities/settings/local/repository.ts`)
- [x] Outbox helpers (`entities/settings/local/outbox-helpers.ts`)
- [x] Sync handler registration
- [x] Outbox handler registration (update only)
- [x] Redux integration
- [x] Dexie table (v2)
- [x] Tests
- [x] FSD architecture review and refactoring
  - Consolidated Redux slice into entity layer (`model/settings.slice.ts`)
  - Removed duplicate slice from `store/slices/settings/`
  - Created `features/settings` for feature-level operations (setDefaultAccount)
  - Added all selectors to entity layer (selectSettings, selectCurrency, selectDefaultAccount)
  - Updated all imports across the codebase

#### Tag Entity

- [x] Schema definition (`entities/tag/local/schema.ts`)
- [x] Repository with CRUD operations (`entities/tag/local/repository.ts`)
- [x] Outbox helpers (`entities/tag/local/outbox-helpers.ts`)
- [x] Sync handler registration
- [x] Outbox handler registration (create/update/delete)
- [x] Redux integration with temp ID handling
- [x] Dexie table (v2)
- [x] Tests (local repository)
- [x] Tests (model/Redux)
- [x] FSD architecture review and refactoring
  - Updated async thunks to use outbox pattern for offline-first
  - Added optimistic updates with temp ID handling
  - Fixed `addTag` reducer to update existing tags instead of duplicating
  - All CRUD operations now use local repository + outbox in dexie mode

#### Category Entity

- [x] Schema definition (`entities/category/local/schema.ts`)
- [x] Repository with CRUD operations (`entities/category/local/repository.ts`)
- [x] Outbox helpers (`entities/category/local/outbox-helpers.ts`)
- [x] Sync handler registration
- [x] Outbox handler registration (create/update/delete)
- [x] Redux integration with temp ID handling
- [x] Dexie table (v3)
- [x] Tests (local repository)
- [x] Tests (model/Redux)
- [x] FSD architecture review and refactoring
  - Simplified async thunks to always use local-first in dexie mode
  - Removed try-catch with navigator.onLine checks (outbox handles offline)
  - Fixed `addCategory` reducer to update existing categories instead of duplicating
  - Fixed `createCategory.fulfilled` to prevent duplicates
  - All CRUD operations now consistently use local repository + outbox
  - Repository tests: 15 tests covering CRUD, sync, dirty flag handling, validation
  - Redux tests: 16 tests covering reducers, async thunks, duplicate prevention

### ✅ Phase 2: Accounts & Exchange Rates (Completed)

#### Account Entity

- [x] Schema definition (`entities/account/local/schema.ts`)
- [x] Repository with CRUD operations (`entities/account/local/repository.ts`)
- [x] Outbox helpers (`entities/account/local/outbox-helpers.ts`)
- [x] Sync handler registration
- [x] Outbox handler registration (create/update/delete/reorder/toggleExcluded)
- [x] Redux integration with temp ID handling
- [x] Dexie table (v4)
- [x] Tests (local repository)
- [x] Tests (model/Redux)
- [x] FSD architecture review and refactoring
  - Removed circular dependency: account slice no longer imports transaction thunks
  - Transaction thunks now dispatch `updateAccountInState` and `setSummary` actions
  - Fixed `addAccount` reducer to update existing accounts instead of duplicating
  - Fixed `createAccount.fulfilled` to prevent duplicates
  - Renamed `updateAccount` action to `updateAccountInState` for clarity
  - All tests updated and passing

#### ExchangeRate Entity (Read-Only)

- [x] Schema definition (`entities/exchange-rate/local/schema.ts`)
- [x] Repository with read-only operations (`entities/exchange-rate/local/repository.ts`)
- [x] Sync handler registration
- [x] Redux integration
- [x] Dexie table (v4)
- [x] Tests (local repository)
- [x] Tests (model/Redux)
- [x] FSD architecture review and refactoring
  - Already follows FSD best practices
  - Read-only entity with proper local-first pattern
  - Clean separation of concerns (model/local/api)
  - No changes needed

### 🔜 Phase 3: Transactions & Transfers

#### Transaction Entity

**Local-First Implementation:**
- [ ] Schema definition (`entities/transaction/local/schema.ts`)
  - TransactionDto payload
  - Sync metadata (updatedAt, syncedAt, isDirty)
  - Indexed fields: accountId, date, type
- [ ] Repository (`entities/transaction/local/repository.ts`)
  - `getById(id)` - single transaction
  - `getAll()` - all transactions
  - `getByAccount(accountId)` - filter by account
  - `getByDateRange(from, to)` - filter by date
  - `save(transaction)` - upsert single
  - `saveMany(transactions)` - bulk upsert
  - `update(id, partial)` - partial update with dirty flag
  - `delete(id)` - remove transaction
  - `syncFromApi(transactions)` - sync from server
  - `clear()` - clear all transactions
- [ ] Outbox helpers (`entities/transaction/local/outbox-helpers.ts`)
  - `enqueueCreate(transaction)`
  - `enqueueUpdate(id, data)`
  - `enqueueDelete(id)`
- [ ] Dexie table (v5)
  - Add `transactions: 'id, updatedAt, accountId, date'`
- [ ] Sync handler registration
  - Fetch from API: `transactionControllerFindAll()`
  - Sync to local repository
- [ ] Outbox handler registration
  - create → `transactionApi.create()`
  - update → `transactionApi.update()`
  - delete → `transactionApi.delete()`
  - Handle account balance updates

**FSD Architecture Refactoring:**
- [ ] Review and refactor Redux store structure
  - Ensure proper slice organization
  - Validate selectors follow FSD patterns
  - Check for proper separation of concerns
- [ ] Review and refactor feature layer
  - Validate feature boundaries
  - Check for proper use of entities layer
  - Ensure no cross-feature dependencies
  - Review UI components structure
- [ ] Update async thunks
  - Migrate to local repository pattern
  - Implement optimistic updates with outbox
  - Handle temp IDs for created transactions
  - Update account balances locally
- [ ] Tests
  - Repository CRUD operations
  - Date range filtering
  - Sync from API
  - Outbox helpers
  - Redux integration tests

#### Transfer Entity

**Local-First Implementation:**
- [ ] Schema definition (`entities/transfer/local/schema.ts`)
  - TransferDto payload
  - Sync metadata (updatedAt, syncedAt, isDirty)
  - Indexed fields: fromAccountId, toAccountId, date
- [ ] Repository (`entities/transfer/local/repository.ts`)
  - `getById(id)` - single transfer
  - `getAll()` - all transfers
  - `getByAccount(accountId)` - filter by account
  - `save(transfer)` - upsert single
  - `saveMany(transfers)` - bulk upsert
  - `update(id, partial)` - partial update with dirty flag
  - `delete(id)` - remove transfer
  - `syncFromApi(transfers)` - sync from server
  - `clear()` - clear all transfers
- [ ] Outbox helpers (`entities/transfer/local/outbox-helpers.ts`)
  - `enqueueCreate(transfer)`
  - `enqueueUpdate(id, data)`
  - `enqueueDelete(id)`
- [ ] Dexie table (v5)
  - Add `transfers: 'id, updatedAt, fromAccountId, toAccountId, date'`
- [ ] Sync handler registration
  - Fetch from API: `transferControllerFindAll()`
  - Sync to local repository
- [ ] Outbox handler registration
  - create → `transferApi.create()`
  - update → `transferApi.update()`
  - delete → `transferApi.delete()`
  - Handle account balance updates

**FSD Architecture Refactoring:**
- [ ] Review and refactor Redux store structure
  - Ensure proper slice organization
  - Validate selectors follow FSD patterns
  - Check for proper separation of concerns
- [ ] Review and refactor feature layer
  - Validate feature boundaries
  - Check for proper use of entities layer
  - Ensure no cross-feature dependencies
  - Review UI components structure
- [ ] Update async thunks
  - Migrate to local repository pattern
  - Implement optimistic updates with outbox
  - Handle temp IDs for created transfers
  - Update account balances locally
- [ ] Tests
  - Repository CRUD operations
  - Account filtering
  - Sync from API
  - Outbox helpers
  - Redux integration tests

### 📝 Phase 4: Testing & Documentation

#### Integration Tests

- [ ] End-to-end sync flow tests
  - Login → local data load → API sync
  - Offline operations → online sync
  - Conflict resolution scenarios
- [ ] Outbox processing tests
  - Retry logic with exponential backoff
  - Failed operation handling
  - Cleanup of old operations
- [ ] Multi-entity sync tests
  - Account + Transaction consistency
  - Transfer + Account balance updates
  - Category/Tag references in transactions

#### Documentation Updates

- [ ] Update `docs/LOCAL_FIRST.md`
  - Add Account, Transaction, Transfer, ExchangeRate sections
  - Document entity relationships
  - Update data flow diagrams
  - Add troubleshooting section
- [ ] Update `CLAUDE.md`
  - Document local-first patterns for new entities
  - Add testing guidelines
  - Update architecture overview
- [ ] Create migration guide
  - How to add local-first to new entities
  - Common patterns and pitfalls
  - Performance considerations

## Implementation Guidelines

### Entity Repository Pattern

Each entity repository should follow this structure:

```typescript
// entities/{entity}/local/schema.ts
export type EntityRow = {
  id: string;
  payload: EntityDto;
  updatedAt: string;
  syncedAt?: string;
  isDirty?: boolean;
};

export function entityRowFromDto(dto: EntityDto, updatedAt: string): EntityRow;
export function entityDtoFromRow(row: EntityRow): EntityDto;
```

```typescript
// entities/{entity}/local/repository.ts
export const entityRepository = {
  async getById(id: string): Promise<EntityDto | null>
  async getAll(): Promise<EntityDto[]>
  async save(entity: EntityDto): Promise<void>
  async saveMany(entities: EntityDto[]): Promise<void>
  async update(id: string, partial: Partial<EntityDto>): Promise<void>
  async delete(id: string): Promise<void>
  async syncFromApi(entities: EntityDto | EntityDto[]): Promise<void>
  async clear(): Promise<void>
}
```

```typescript
// entities/{entity}/local/outbox-helpers.ts
export async function enqueueCreate(entity: CreateEntityDto): Promise<void>;
export async function enqueueUpdate(
  id: string,
  data: UpdateEntityDto,
): Promise<void>;
export async function enqueueDelete(id: string): Promise<void>;
```

### Dexie Schema Versioning

When adding a new entity table:

1. Increment version number
2. Copy all previous table definitions
3. Add new table with indexed fields
4. Test migration from previous version

```typescript
this.version(4).stores({
  // ... all previous tables
  newEntity: "id, updatedAt, indexedField1, indexedField2",
});
```

### Redux Integration Pattern

Update async thunks to work with local repository:

```typescript
export const createEntity = createAsyncThunk(
  "entity/create",
  async (data: CreateEntityDto) => {
    if (LOCAL_DATA_MODE === "dexie") {
      // Generate temp ID
      const tempId = `temp-${Date.now()}`;
      const entity = { ...data, id: tempId };

      // Save locally with dirty flag
      await entityRepository.update(tempId, entity);

      // Enqueue for sync
      await enqueueCreate(data);

      return entity;
    }

    // API-only mode
    return entityApi.create(data);
  },
);
```

### Testing Pattern

Use `fake-indexeddb` for repository tests:

```typescript
import "fake-indexeddb/auto";
import { db } from "@/lib/local/db";
import { entityRepository } from "./repository";

describe("entityRepository", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("should save and retrieve entity", async () => {
    const entity = { id: "1", name: "Test" };
    await entityRepository.save(entity);
    const retrieved = await entityRepository.getById("1");
    expect(retrieved).toEqual(entity);
  });
});
```

## Performance Considerations

### Indexing Strategy

- **Primary key**: Always `id`
- **Timestamp**: Always index `updatedAt` for sync queries
- **Foreign keys**: Index relationship fields (accountId, categoryId, etc.)
- **Date fields**: Index for range queries (transaction date, transfer date)
- **Avoid over-indexing**: Each index increases write cost

### Sync Optimization

- **Incremental sync**: Use `lastSyncAt` to fetch only changed records
- **Batch operations**: Use `bulkPut()` for multiple records
- **Selective sync**: Only sync entities needed for current view
- **Background sync**: Use Web Workers for heavy sync operations (future)

### Memory Management

- **Pagination**: Don't load all transactions at once
- **Lazy loading**: Load related entities on demand
- **Cache eviction**: Clear old data periodically
- **Compaction**: Run IndexedDB compaction on logout

## Rollout Strategy

### Phase 1: Foundation (Completed)

- Core infrastructure
- User, Settings, Tag, Category entities
- Basic sync and outbox processing

### Phase 2: Financial Core (Completed)

- Account entity (base for all financial operations)
- ExchangeRate entity (read-only reference data)
- Testing and validation

### Phase 3: Transactions (Next)

- Transaction entity (main user data)
- Transfer entity (account-to-account operations)
- Performance optimization

### Phase 4: Polish (Final)

- Integration tests
- Documentation updates
- Performance monitoring
- User feedback collection

## Success Metrics

- [ ] All entities have local-first support
- [ ] Offline mode works for all CRUD operations
- [ ] Sync completes in <5 seconds for typical dataset
- [ ] No data loss in offline → online transitions
- [ ] Test coverage >80% for local repositories
- [ ] Documentation complete and up-to-date

## Known Issues & Future Work

### Current Limitations

- Last-write-wins conflict resolution (no operational transformation)
- No sync progress UI indicators
- No selective sync (all entities sync together)
- No data migration system for schema changes

### Future Enhancements

- Operational transformation for better conflict resolution
- Sync progress indicators in UI
- Selective sync based on user activity
- Data migration system for schema evolution
- Sync queue prioritization (user actions first)
- Telemetry and monitoring
- Web Worker for background sync
- Service Worker for offline support
