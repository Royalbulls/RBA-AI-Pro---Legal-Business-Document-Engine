# Security Spec & TDD payloads for Document Generator with Profiles

## 1. Data Invariants
- A **Profile** must belong to the user who created it (`userId` MUST equal `request.auth.uid`).
- A **GeneratedDocument** must belong to the user who generated it (`userId` MUST equal `request.auth.uid`).
- Non-owners cannot read, create, update, or delete profiles and documents.
- User email verification is required if the security rules enforce standard write verification (`request.auth.token.email_verified == true`). However, for simple onboarding through popup Google Auth we will check user is signed in, or if email_verified is applicable depending on provider. To maximize security and compatibility without locking out standard users, we enforce simple signed-in owner checks: `request.auth.uid == resource.data.userId` for read/write.
- All IDs (`profileId`, `documentId`) must be checked with `isValidId(id)`.
- Timestamps like `createdAt` and `updatedAt` must be verified using `request.time`.

## 2. The Dirty Dozen Payloads
Below are 12 payloads representing security policy violations that MUST be blocked (Permission Denied):

1. **Identity Spoofing - Create Profile with fake userId**:
   - `request.auth.uid` is `user123`
   - Payload: `{ id: 'p1', userId: 'attacker_uid', partyType: 'first_party_company', name: 'Fake Company', createdAt: request.time, updatedAt: request.time }`

2. **Shadow Field Injection - Create Profile with unauthorized roles**:
   - Payload: `{ id: 'p1', userId: 'user123', partyType: 'first_party_company', name: 'Fake Company', isAdmin: true, createdAt: request.time, updatedAt: request.time }`

3. **Temporal Violation - Create Profile with custom future/past createdAt timestamp**:
   - Payload: `{ id: 'p1', userId: 'user123', partyType: 'first_party_company', name: 'Fake Company', createdAt: timestamp("2030-01-01T00:00:00Z"), updatedAt: request.time }`

4. **Malicious ID Poisoning - Attempt to create a Profile with a 1MB size ID containing invalid characters**:
   - ID: `a_very_long_attacker_string_greater_than_128_chars...`

5. **Type Poisoning - Update Profile 'name' field with non-string (Boolean) type**:
   - Payload: `{ name: true }`

6. **Privilege Escalation - Update Profile to change owner `userId` field**:
   - Attempt to change existing `userId` 'user123' to 'hacker123'.

7. **Immutability Breach - Update Profile changing `createdAt` timestamp**:
   - Attempt to change `createdAt` to a different time.

8. **Read Poisoning - Non-owner trying to list other's profiles**:
   - `request.auth.uid` is `attacker123`, querying profiles where `userId` is `victim123`.

9. **Blanket Query Scraping - Trying to fetch all profiles with list without restrictions**:
   - Query: `db.collection('profiles')` without `.where('userId', '==', uid)` check.

10. **Document Hijack - Attacker trying to update a victim's document content**:
    - Attacker authenticated, target document lacks owner matching.

11. **Malicious Document Payload - Create document with empty title or invalid type structure**:
    - Payload with missing required fields in schema validation.

12. **Out-of-Order Status Lock - Malicious write to bypass schema validations during update**:
    - Patch payload missing the required `isValidDocument` schema fields.

## 3. Test Runner Concept (Conceptual firestore.rules.test.ts)
The corresponding tests would check:
- `assertFails(createProfileWithFakeUserId)`
- `assertFails(createProfileWithShadowFields)`
- `assertFails(createProfileWithPastTimestamp)`
- `assertFails(readProfileAsNonOwner)`
- `assertFails(listProfilesWithoutWhereFilters)`
